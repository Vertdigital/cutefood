# CF-070 — Modelagem Multi-Tenant do Firestore

## Índice
1. [Objetivo desta Refatoração](#objetivo-desta-refatoração)
2. [Árvore de Relacionamentos](#árvore-de-relacionamentos)
3. [Coleções](#coleções)
4. [O Briefing Não É Mais um Pedido](#o-briefing-não-é-mais-um-pedido)
5. [Fluxo Completo](#fluxo-completo)
6. [Multi-Tenant: a Regra do `companyId`](#multi-tenant-a-regra-do-companyid)
7. [IDs de Documento](#ids-de-documento)
8. [Compatibilidade com a Interface Atual](#compatibilidade-com-a-interface-atual)
9. [Services Atualizados](#services-atualizados)
10. [Próximos Passos](#próximos-passos)

---

## Objetivo desta Refatoração

Até esta etapa, o `briefing` acumulava responsabilidades que não eram dele: dados de descoberta (evento, tema, sabores) **e** dados comerciais (orçamento, entrega) **e** o próprio ciclo de vida de um pedido (Novo → Orçamento → Produção → Finalizado). Essa refatoração separa essas responsabilidades em coleções distintas e prepara toda a base de dados para operar com múltiplas empresas (multi-tenant) — não apenas a CuteFood CWB.

Esta etapa é **somente arquitetura**: nenhuma tela ou componente visual foi alterado.

## Árvore de Relacionamentos

```
company
 ├── customers
 ├── conversations
 │      └── messages
 ├── briefings
 ├── orders
 └── workOrders
```

Importante: esta árvore é **conceitual**, não uma estrutura literal de subcoleções do Firestore. Na prática, todas as coleções são coleções de nível raiz (`companies`, `customers`, `conversations`, `messages`, `briefings`, `orders`, `workOrders`), e o relacionamento com a empresa é feito através do campo `companyId` presente em todo documento — não por aninhamento de caminho. Essa escolha torna as queries multi-tenant mais simples e evita as limitações de queries em coleções profundamente aninhadas no Firestore.

## Coleções

### `companies`
O tenant. Cada empresa cliente da Vértice Next AI (ex.: CuteFood CWB) é um documento aqui.

### `customers`
Os clientes finais de uma empresa (antes, misturados dentro do próprio `briefing` como `cliente`/`telefone`). Agora existem como entidade própria, permitindo, por exemplo, um cliente ter várias conversas/pedidos ao longo do tempo.

### `conversations` / `messages`
Já existiam desde a integração com o Claude (ver `docs/integracoes/claude.md`). Ganham `companyId` e, no caso de `conversations`, `customerId`.

### `briefings`
Continua existindo, mas com escopo reduzido — ver seção seguinte.

### `orders` (Pedidos)
**Nova coleção.** Nasce da aprovação manual de um briefing. Carrega os dados comerciais (`orcamento`, `entrega`) e o status de pedido (`Aguardando produção`, `Em produção`, `Finalizado`, `Cancelado`).

### `workOrders` (Ordens de Serviço)
**Nova coleção.** Nasce de um `order` já aprovado, representando o acompanhamento da produção (`Pendente`, `Em produção`, `Concluída`), com responsável e observações de produção.

## O Briefing Não É Mais um Pedido

Antes desta etapa, o campo `status` do briefing assumia valores de pipeline comercial (`Novo`, `Briefing`, `Orçamento`, `Aprovado`, `Produção`, `Finalizado`) e o próprio briefing tinha `orcamento`/`entrega`.

A partir de agora, o **briefing representa só a etapa de descoberta** de uma conversa — o que a assistente conseguiu levantar com o cliente antes de qualquer decisão comercial. Seu ciclo de vida próprio passa a ser:

```
Em coleta → Completo → Aprovado | Rejeitado
```

Dados comerciais e de produção não pertencem mais a ele — pertencem a `orders` e `workOrders`, respectivamente.

## Fluxo Completo

```
Conversa
  ↓
Briefing
  ↓
Aprovação Manual
  ↓
Pedido
  ↓
Ordem de Serviço
```

1. Uma **conversa** acontece (via WhatsApp → Evolution → n8n → Claude, ver `docs/integracoes/claude.md`).
2. O workflow do n8n mantém um **briefing** atualizado com o que foi descoberto na conversa.
3. Uma pessoa (a confeiteira) faz a **aprovação manual** do briefing — decide preço e condições de entrega.
4. Essa aprovação gera um **pedido** (`orders`), via `createOrderFromBriefing()` em `src/services/orders.ts`. O briefing de origem é marcado como `"Aprovado"`.
5. Quando o pedido entra em produção, uma **ordem de serviço** (`workOrders`) é criada via `createWorkOrderFromOrder()` em `src/services/workOrders.ts`, e o pedido passa para `"Em produção"`.

## Multi-Tenant: a Regra do `companyId`

**Nenhum documento, em nenhuma coleção, pode existir sem `companyId`.** Isso é reforçado em três camadas:

1. **Tipos TypeScript** — todo `interface` de service (`Customer`, `Order`, `WorkOrder`, `Briefing`, `Conversa`, `Mensagem`) declara `companyId: string` como campo obrigatório.
2. **Regras do Firestore** (`firestore.rules`) — a função `temCompanyId()` exige que toda escrita em `customers`, `orders`, `workOrders` e `briefings` inclua um `companyId` do tipo string não vazio. (`conversations`/`messages` são gravadas pelo workflow do n8n via credencial de serviço, que tecnicamente contorna as regras — mesmo assim, o workflow já inclui `companyId` em todo documento que cria.)
3. **Constante compartilhada** (`src/lib/tenant.js`) — `DEFAULT_COMPANY_ID`, usada como valor padrão enquanto não existe login/seleção real de empresa na interface.

## IDs de Documento

- `companies/{id}`: ID livre (ex.: `cutefood-cwb`).
- `customers/{id}`, `orders/{id}`, `workOrders/{id}`, `briefings/{id}`: ID autogerado pelo Firestore.
- `conversations/{id}`: **composto** — `${companyId}_${telefone}` (ex.: `cutefood-cwb_5541999998888`). Isso evita colisão caso o mesmo número de telefone apareça em duas empresas diferentes.
- `messages/{id}`: ID autogerado; referencia a conversa via campo `conversationId` (o ID composto acima).

## Compatibilidade com a Interface Atual

Esta etapa é **somente arquitetura** — nenhuma tela foi alterada. Isso significa que o Dashboard, o Pipeline, o Analytics e a Agenda continuam, por enquanto, lendo diretamente da coleção `briefings` e exibindo seus campos legados (`orcamento`, e valores de `status` como `"Orçamento"`/`"Produção"`/`"Finalizado"`), marcados como `@deprecated` em `src/services/briefings.ts`.

Isso é intencional: migrar essas telas para consumir `orders`/`workOrders` é a próxima etapa natural, mas exigiria alterar a lógica de várias páginas (o que está fora do escopo "somente arquitetura" pedido aqui). Os services `orders.ts` e `workOrders.ts` já existem, testados e prontos — a migração da interface é, portanto, um passo isolado e de baixo risco quando for priorizada.

## Services Atualizados

| Arquivo | O que mudou |
|---|---|
| `src/services/companies.ts` | **Novo.** CRUD básico de empresas (tenants). |
| `src/services/customers.ts` | **Novo.** CRUD de clientes, escopado por `companyId`. |
| `src/services/orders.ts` | **Novo.** `createOrderFromBriefing()`, `updateOrder()`, `deleteOrder()`, `getOrders()`, `subscribeOrders()`. |
| `src/services/workOrders.ts` | **Novo.** `createWorkOrderFromOrder()`, `updateWorkOrder()`, `deleteWorkOrder()`, `getWorkOrders()`, `subscribeWorkOrders()`. |
| `src/services/briefings.ts` | Interface `Briefing` ganha `companyId`, `customerId`, `conversationId`; `orcamento`/`entrega` marcados `@deprecated`. Funções existentes (`createBriefing`, `updateBriefing`, `deleteBriefing`, `getBriefing`, `getBriefings`, `subscribeBriefings`) mantidas sem quebra de compatibilidade. |
| `src/services/conversations.ts` | Interfaces `Conversa`/`Mensagem` ganham `companyId` (e `customerId` em `Conversa`). |
| `src/lib/tenant.js` | **Novo.** Constante `DEFAULT_COMPANY_ID`. |

## Próximos Passos

- Migrar Dashboard/Pipeline/Analytics/Agenda para consumir `orders` (não mais `briefings`) como fonte da visão comercial/produção — telas continuam com o mesmo layout, só troca a fonte de dados.
- Criar a tela (ou ação) de "Aprovação Manual" que chama `createOrderFromBriefing()`.
- Adicionar seleção de empresa (multi-tenant real) quando o Authentication for ativado na interface.
- Atualizar `workflows/briefing.json` e `workflows/atendimento-ia.json` para também popular `customers` (hoje o `customerId` é gravado vazio nesses workflows, aguardando essa etapa).
