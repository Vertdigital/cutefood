# Integração com o Claude — Arquitetura Oficial

## Índice
1. [Princípio Central](#princípio-central)
2. [Arquitetura](#arquitetura)
3. [Workflow "Atendimento IA"](#workflow-atendimento-ia)
4. [Estrutura de Coleções no Firestore](#estrutura-de-coleções-no-firestore)
5. [Decisões de Design](#decisões-de-design)
6. [O Papel do Frontend](#o-papel-do-frontend)
7. [Variáveis de Ambiente (no n8n)](#variáveis-de-ambiente-no-n8n)
8. [Prompt de Sistema](#prompt-de-sistema)
9. [Nó Adicional: Envio da Resposta](#nó-adicional-envio-da-resposta)
10. [O que NÃO está integrado ainda](#o-que-não-está-integrado-ainda)

---

## Princípio Central

**Nenhuma chamada para o Claude sai do frontend.** Toda comunicação com a API do Claude acontece exclusivamente dentro de um workflow do n8n, rodando no servidor. O frontend (o painel que a confeiteira usa) nunca conhece a existência do Claude — ele apenas lê o Firestore.

Isso existe por dois motivos:
1. **Segurança**: a chave da API do Claude nunca pode ficar exposta no navegador (diferente do que fizemos, por necessidade de prototipagem, com a Evolution API — ver aviso em `docs/integracoes/evolution.md`).
2. **Arquitetura**: o Claude só precisa ser acionado quando uma mensagem real chega pelo WhatsApp — um evento de servidor, não de interface.

## Arquitetura

```
WhatsApp
  ↓
Evolution
  ↓
n8n
  ↓
Claude API
  ↓
Firestore
  ↓
Dashboard
```

O Dashboard (e todas as outras telas) só participa do último passo: **ouvir** o Firestore via `onSnapshot` e exibir o que já foi salvo. Ele nunca aciona nada antes disso.

## Workflow "Atendimento IA"

Arquivo: [`workflows/atendimento-ia.json`](../../workflows/atendimento-ia.json).

Fluxo pedido:
```
Webhook
  ↓
Receber mensagem
  ↓
Montar contexto
  ↓
Enviar para Claude
  ↓
Receber resposta
  ↓
Salvar conversa
  ↓
Salvar briefing atualizado
  ↓
Responder webhook
```

Nós do workflow (21 ao todo, incluindo os pontos de apoio necessários para o fluxo acima funcionar de verdade):

| Nó | Corresponde a | Descrição |
|---|---|---|
| Webhook | Webhook | Recebe o evento de mensagem enviado pela Evolution API |
| Receber mensagem | Receber mensagem | Extrai número, texto, nome do cliente e ID da mensagem do payload da Evolution |
| É eco da própria IA? | (apoio) | Ignora mensagens que a própria instância enviou (evita loop) |
| Buscar conversa / Resolver estado | (apoio) | Verifica se já existe uma conversa e um briefing para este número |
| Buscar mensagens anteriores | (apoio) | Traz o histórico da coleção `messages` para dar contexto ao Claude |
| Buscar briefing atual | (apoio) | Se já existe um briefing para esta conversa, traz os dados já coletados |
| Montar contexto | Montar contexto | Monta o prompt de sistema + histórico + mensagem nova para o Claude |
| Enviar para Claude | Enviar para Claude | `POST https://api.anthropic.com/v1/messages` |
| Receber resposta | Receber resposta | Extrai o texto de resposta e o briefing atualizado da saída do Claude |
| Salvar mensagem do cliente / Salvar mensagem da IA | Salvar conversa | Grava as duas mensagens do turno na coleção `messages` |
| Criar ou atualizar briefing / Atualizar briefing existente / Criar novo briefing / Extrair novo briefingId | Salvar briefing atualizado | Atualiza o briefing existente ou cria um novo, vinculado à conversa |
| Atualizar conversa | (apoio) | Atualiza o documento da conversa com a última mensagem e o `briefingId` |
| Enviar resposta via Evolution | *(adicional)* | Envia a resposta do Claude de volta ao cliente pelo WhatsApp |
| Responder webhook | Responder webhook | Devolve um JSON de confirmação para quem chamou o webhook |

## Estrutura de Coleções no Firestore

Três coleções compõem o histórico de atendimento:

### `conversations`
Uma conversa por número de telefone — o **ID do documento é o próprio número** (ex: `5541999998888`), não um ID gerado automaticamente.

| Campo | Tipo | Descrição |
|---|---|---|
| telefone | string | Mesmo valor do ID do documento |
| cliente | string | Nome vindo do WhatsApp (`pushName`) |
| briefingId | string | ID do briefing atualmente vinculado a esta conversa |
| ultimaMensagem | string | Texto da última resposta da IA, para exibição rápida |
| status | string | Ex.: "Em atendimento" |
| updatedAt | timestamp | Atualizado a cada novo turno |

### `messages`
Uma mensagem por documento, todas relacionadas a uma conversa via `conversationId`.

| Campo | Tipo | Descrição |
|---|---|---|
| conversationId | string | Igual ao número de telefone / ID da conversa |
| autor | string | `"cliente"` ou `"ia"` |
| texto | string | Conteúdo da mensagem |
| hora | string | Hora formatada, para exibição |
| createdAt | timestamp | Usado para ordenar a timeline |

### `briefings`
Já existente desde a integração com o Firestore (ver o histórico do projeto). Ganha, nesta etapa, um novo campo:

| Campo novo | Tipo | Descrição |
|---|---|---|
| conversationId | string | Liga o briefing à conversa que o originou (mesmo valor do telefone) |

## Decisões de Design

- **ID da conversa = número de telefone.** Simplifica todo o workflow (não é preciso rodar uma query para descobrir se a conversa existe — basta tentar um `GET` direto no documento). A contrapartida é que, hoje, cada número tem sempre uma única conversa "corrente"; se um mesmo cliente fizer um novo pedido bem depois de o anterior ser finalizado, ele reaproveita a mesma conversa. Isso é uma simplificação deliberada para esta etapa — pode ser refinado depois (ex.: encerrar/arquivar conversas finalizadas).
- **Resposta do Claude em JSON estruturado.** O prompt de sistema pede que o Claude devolva `{ "resposta": "...", "briefing": {...} }` em uma única chamada, evitando uma segunda chamada só para extrair os dados do briefing.
- **O briefing nunca perde dados já coletados.** O node "Montar contexto" sempre envia o briefing atual para o Claude, e o node "Receber resposta" faz um merge (`{...briefingAtual, ...briefingNovo}`) antes de gravar — assim, um campo não mencionado no turno atual não é apagado.
- **Multi-tenant desde a origem.** Todo documento criado por este workflow (`conversations`, `messages`, `briefings`) inclui `companyId`, e o ID da conversa é composto (`${companyId}_${numero}`) — ver `docs/arquitetura/CF-070-modelagem-multi-tenant.md`. O briefing criado aqui já segue o novo modelo em que ele **não** representa um pedido — dados comerciais (orçamento, entrega) ficam para a etapa de aprovação manual, fora deste workflow.

## O Papel do Frontend

O frontend deve, exclusivamente:
- **Ouvir** alterações do Firestore (`onSnapshot`, já usado em `src/services/briefings.ts`);
- **Exibir** as mensagens (a Timeline da tela de detalhe do briefing);
- **Exibir** o briefing (Dashboard, Briefings, Clientes, Agenda, Pipeline, Analytics — como já funciona).

Nenhuma chamada direta ao Claude existe ou deve ser adicionada no frontend. A criação manual de briefings pela simulação de atendimento (ver `docs/integracoes/n8n.md`) continua passando pelo workflow `briefing.json` — um caminho propositalmente separado do `atendimento-ia.json`, que é reservado para mensagens reais de WhatsApp.

## Variáveis de Ambiente (no n8n)

Estas variáveis vivem no **ambiente do n8n**, não no `.env` do frontend (o frontend não faz nenhuma chamada relacionada ao Claude):

```bash
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-5   # ajuste para o modelo disponível na sua conta
FIREBASE_PROJECT_ID=seu-projeto-firebase
DEFAULT_COMPANY_ID=cutefood-cwb      # multi-tenant — ver docs/arquitetura/CF-070-modelagem-multi-tenant.md
EVOLUTION_URL=sua-evolution-api.exemplo.com
EVOLUTION_INSTANCE=nome-da-instancia
EVOLUTION_API_KEY=sua-api-key
```

## Prompt de Sistema

O prompt de sistema embutido no node "Montar contexto" segue o **Prompt Mestre oficial** definido em `docs/prompts/CF-040-prompt-mestre.md` (personalidade, o que a IA pode/não pode fazer, regras de condução do briefing), adaptado para também exigir uma saída em JSON estruturado. Qualquer alteração de comportamento da assistente deve ser feita primeiro naquele documento, e só depois refletida neste node.

## Nó Adicional: Envio da Resposta

O fluxo literal pedido termina em "Responder webhook" — mas isso, sozinho, só devolve uma confirmação para quem chamou o webhook (a própria Evolution), sem a mensagem chegar de fato ao cliente. Por isso o workflow inclui um nó extra, **"Enviar resposta via Evolution"**, entre "Atualizar conversa" e "Responder webhook", usando os mesmos endpoints documentados em `docs/integracoes/evolution.md`. Sem esse nó, a IA nunca responderia de verdade no WhatsApp.

## O que NÃO está integrado ainda

- ❌ Qualquer chamada ao Claude a partir do frontend (e nunca deve haver)
- ❌ Envio/recebimento de imagens tratado pelo Claude (o campo `temImagem` já é capturado em "Receber mensagem", mas ainda não é enviado ao Claude como parte da análise)
- ❌ Encerramento/arquivamento automático de conversas finalizadas
- ❌ Painel de configuração da assistente (tela "Configurações" do frontend) ainda não é lido por este workflow — o prompt de sistema está fixo no node, não vem do Firestore
