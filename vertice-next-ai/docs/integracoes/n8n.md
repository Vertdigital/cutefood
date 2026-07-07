# Integração com n8n — Criação de Briefings

## Índice
1. [Visão Geral](#visão-geral)
2. [Fluxo](#fluxo)
3. [Escopo desta Etapa](#escopo-desta-etapa)
4. [Arquivo do Workflow](#arquivo-do-workflow)
5. [Configurando o Webhook](#configurando-o-webhook)
6. [Autenticação com o Firestore](#autenticação-com-o-firestore)
7. [Contrato de Dados](#contrato-de-dados)
8. [Variável de Ambiente](#variável-de-ambiente)
9. [Service do Frontend](#service-do-frontend)
10. [Tratamento de Erros](#tratamento-de-erros)
11. [O que NÃO está integrado ainda](#o-que-não-está-integrado-ainda)

---

## Visão Geral

A partir desta etapa, **toda criação de um novo briefing passa por um workflow do n8n** — o front-end não grava mais o documento diretamente no Firestore. Quem grava é o próprio workflow, depois de validar os dados recebidos.

Isso cria uma camada de orquestração entre o front-end e o banco de dados, preparando o terreno para as próximas integrações (WhatsApp, Evolution API, Claude) sem que o front-end precise saber, nesta etapa, como o briefing é efetivamente processado.

## Fluxo

```
Frontend
  ↓
Webhook do n8n
  ↓
Validar dados
  ↓
Salvar no Firestore
  ↓
Retornar JSON
  ↓
Frontend (onSnapshot já ativo mostra o novo briefing em tempo real)
```

Importante: o front-end **não** faz polling nem espera o Firestore depois de chamar o webhook — a lista de briefings já está assinada em tempo real via `subscribeBriefings` (`src/services/briefings.ts`), então assim que o workflow grava o documento, a tela atualiza sozinha. O `id` devolvido pelo webhook é usado apenas para abrir diretamente a tela de detalhe do briefing recém-criado.

## Escopo desta Etapa

- ✅ **Criação** de briefing passa pelo n8n (simulação de atendimento e botão de popular dados de exemplo em desenvolvimento).
- ❌ Edição, exclusão e mudança de status (Pipeline) **continuam indo direto ao Firestore**, via `src/services/briefings.ts` — não fazem parte do escopo pedido nesta etapa.
- ❌ Sem WhatsApp, sem Evolution API, sem Claude — o workflow recebe um payload já pronto vindo da simulação de atendimento do front-end, não de uma conversa real.

## Arquivo do Workflow

O workflow exportado está em [`workflows/briefing.json`](../../workflows/briefing.json) e pode ser importado diretamente no n8n (`Import from File` ou `Import from Clipboard`).

Nós do workflow:

| Nó | Tipo | Função |
|---|---|---|
| Webhook | `n8n-nodes-base.webhook` | Recebe o POST do front-end em `/webhook/briefing` |
| Validar dados | Code | Confere campos obrigatórios, valores de `status`/`complexidade` e o formato da `data` |
| Dados válidos? | IF | Decide entre o caminho de sucesso e o de erro |
| Formatar documento Firestore | Code | Converte o payload para o formato de campos tipados da API REST do Firestore |
| Salvar no Firestore | HTTP Request | `POST` para a API REST do Firestore (coleção `briefings`) |
| Formatar resposta de sucesso / erro | Code | Monta o JSON de retorno |
| Responder sucesso / erro | Respond to Webhook | Devolve o JSON ao front-end (200 ou 400) |

## Configurando o Webhook

1. Importe `workflows/briefing.json` no seu n8n.
2. Abra o nó **Webhook** e copie a URL de produção (ou de teste, durante o desenvolvimento).
3. Cole essa URL na variável `VITE_N8N_WEBHOOK_URL` do seu `.env` (veja `.env.example`).
4. Ative o workflow no n8n (toggle "Active").

## Autenticação com o Firestore

O nó **Salvar no Firestore** chama a API REST do Firestore diretamente (`https://firestore.googleapis.com/v1/projects/{project}/databases/(default)/documents/briefings`), em vez de depender de um node nativo específico do Firestore — isso torna o workflow portável entre diferentes versões/instalações do n8n.

Para autenticar:

1. Crie uma **Service Account** no Google Cloud com o papel `Cloud Datastore User` (ou equivalente) no projeto Firebase.
2. No n8n, configure uma credencial do tipo Google (Service Account/OAuth2) com o escopo `https://www.googleapis.com/auth/datastore`, seguindo a documentação oficial do n8n para credenciais Google.
3. Associe essa credencial ao nó **Salvar no Firestore**.
4. Defina a variável de ambiente `FIREBASE_PROJECT_ID` no próprio n8n (usada na URL da requisição via `{{$env.FIREBASE_PROJECT_ID}}`).
5. Defina também `DEFAULT_COMPANY_ID` no n8n (ex.: `cutefood-cwb`) — todo briefing criado por este workflow inclui `companyId`, seguindo o modelo multi-tenant descrito em `docs/arquitetura/CF-070-modelagem-multi-tenant.md`.

> Os nomes exatos de menus/telas de credenciais podem variar conforme a versão do n8n — consulte a documentação oficial do n8n para o passo a passo mais atual de credenciais Google.

## Contrato de Dados

**Requisição** (`POST` para o Webhook) — mesmo formato aceito por `createBriefing` no Firestore:

```json
{
  "cliente": "string",
  "telefone": "string",
  "evento": "string",
  "data": "AAAA-MM-DD",
  "tema": "string",
  "sabores": "string",
  "quantidade": "string",
  "orcamento": "string",
  "entrega": "string",
  "referencias": 0,
  "observacoes": "string",
  "status": "Novo | Briefing | Orçamento | Aprovado | Produção | Finalizado",
  "complexidade": "Simples | Média | Alta",
  "avatarBg": "string (opcional)",
  "avatarText": "string (opcional)",
  "mensagens": [{ "autor": "cliente | ia", "texto": "string", "hora": "string" }]
}
```

**Resposta de sucesso** (`200`):
```json
{ "success": true, "id": "ID_DO_DOCUMENTO_NO_FIRESTORE" }
```

**Resposta de erro de validação** (`400`):
```json
{ "success": false, "error": "Dados inválidos para criação do briefing.", "erros": ["Campo obrigatório ausente ou vazio: cliente"] }
```

## Variável de Ambiente

```bash
VITE_N8N_WEBHOOK_URL=https://seu-n8n.exemplo.com/webhook/briefing
```

Sem essa variável configurada, `createBriefingFromWebhook()` lança um erro explicativo antes mesmo de tentar a chamada de rede.

## Service do Frontend

`src/services/n8n.ts` expõe:

```ts
createBriefingFromWebhook(payload: NovoBriefingPayload): Promise<N8nBriefingResponse>
```

Único ponto do front-end que aciona o workflow. É usado em dois lugares de `src/App.jsx`:
- Ao concluir a simulação de atendimento (`SimulationModal`);
- No botão "Popular com dados de exemplo" (disponível apenas em desenvolvimento).

## Tratamento de Erros

`createBriefingFromWebhook` lança um erro (`Error`) legível em três situações:
1. Variável de ambiente não configurada;
2. Falha de rede ao chamar o Webhook (workflow inativo, URL errada, etc.);
3. O workflow respondeu, mas com `success: false` (dados inválidos) — nesse caso, a mensagem inclui os detalhes de `erros`.

O `SimulationModal` captura esse erro e exibe a mensagem diretamente na tela, permitindo tentar novamente sem perder o progresso da conversa simulada.

## O que NÃO está integrado ainda

- ❌ WhatsApp
- ❌ Evolution API
- ❌ Claude (a IA que efetivamente conduz a conversa)

Essas integrações ficam para as próximas etapas, fora do escopo deste documento.
