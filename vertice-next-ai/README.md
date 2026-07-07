# Vértice Next AI — Demonstração (integrada ao Firestore)

Plataforma de atendimento inteligente da Vértice.
**Projeto Piloto: CuteFood CWB.**

Nesta etapa, a coleção `briefings` já é lida e gravada **de verdade** no
Cloud Firestore. WhatsApp, n8n e Claude (o modelo de IA) ainda **não** estão
integrados — a assistente de atendimento continua sendo simulada em texto
dentro do app, mas o que ela produz agora é salvo como um documento real no
Firestore, e todas as telas (Dashboard, Briefings, Clientes, Agenda, Pipeline,
Analytics) leem esse mesmo dado ao vivo.

## Pré-requisitos

- [Node.js](https://nodejs.org) 20 ou superior
- Uma conta no [Firebase](https://console.firebase.google.com) com um projeto criado

## 1. Configurando o Firebase

1. Crie um projeto em https://console.firebase.google.com (ou use um existente).
2. No menu lateral, ative o **Firestore Database** (modo produção ou teste — as
   regras deste repositório em `firestore.rules` liberam leitura/escrita para
   viabilizar a demonstração; ajuste antes de ir para produção com dados reais).
3. Ative também o **Authentication** (qualquer provedor, ex. E-mail/senha) —
   ele já está configurado em `src/firebase/firebase.ts`, mas ainda não é
   utilizado pela interface nesta etapa.
4. Em **Configurações do projeto > Geral > Seus apps**, crie um app Web e
   copie as credenciais (`apiKey`, `authDomain`, `projectId` etc.).
5. Copie `.env.example` para `.env` e cole as credenciais:
   ```bash
   cp .env.example .env
   ```

## 2. Rodando localmente

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (algo como `http://localhost:5173`).

Na primeira execução, a coleção `briefings` estará vazia — use o botão
**"Popular com dados de exemplo"** que aparece no Dashboard/Briefings para
gravar 6 briefings de demonstração no seu Firestore com um clique.

## 3. Build de produção

```bash
npm run build
npm run preview   # opcional, para conferir a build localmente
```

## 4. Deploy no Netlify

O `netlify.toml` já está configurado:
- **Build command:** `npm run build`
- **Publish directory:** `dist`

Lembre-se de configurar as mesmas variáveis do `.env` também nas
**Environment variables** do site no Netlify (Site settings > Environment
variables), já que o `.env` local não é enviado para o Git/Netlify.

## 5. Deploy das regras do Firestore (opcional)

Se você tiver o [Firebase CLI](https://firebase.google.com/docs/cli) instalado:

```bash
npm install -g firebase-tools
firebase login
# edite .firebaserc e troque "SEU-PROJECT-ID-AQUI" pelo ID do seu projeto
firebase deploy --only firestore:rules
```

## O que já está integrado

- ✅ Firestore configurado (`src/firebase/firebase.ts`)
- ✅ Coleção `briefings` com CRUD completo (`src/services/briefings.ts`):
  `createBriefing`, `updateBriefing`, `deleteBriefing`, `getBriefing`,
  `getBriefings`, e um bônus `subscribeBriefings` para leitura em tempo real
- ✅ Dashboard, Briefings, Clientes, Agenda, Pipeline e Analytics lendo dados
  reais do Firestore (Clientes/Pipeline/Analytics são **derivados** de
  `briefings` em tempo de execução — não há coleções duplicadas)
- ✅ **Criação de briefing via n8n**: Frontend → Webhook (`workflows/briefing.json`)
  → validação → Firestore → resposta JSON → `onSnapshot` atualiza a tela em
  tempo real. Veja [`docs/integracoes/n8n.md`](docs/integracoes/n8n.md).
- ✅ **Envio via Evolution API** (`src/services/evolution.ts`): `sendText`,
  `sendTyping`, `sendRead`, `sendImage`. Ainda sem recebimento de mensagens
  nem resposta automática. Veja [`docs/integracoes/evolution.md`](docs/integracoes/evolution.md).
- ✅ **Atendimento com IA via Claude, 100% no n8n** (`workflows/atendimento-ia.json`):
  WhatsApp → Evolution → n8n → Claude API → Firestore → Dashboard. Nenhuma
  chamada ao Claude sai do frontend — ele só ouve o Firestore
  (`src/services/conversations.ts`) e exibe mensagens/briefing. Veja
  [`docs/integracoes/claude.md`](docs/integracoes/claude.md).
- ✅ **Modelagem multi-tenant refatorada**: novas coleções `companies`,
  `customers`, `orders` e `workOrders`; o `briefing` deixou de representar
  um pedido (fluxo: Conversa → Briefing → Aprovação Manual → Pedido → Ordem
  de Serviço); todo documento carrega `companyId`. Veja
  [`docs/arquitetura/CF-070-modelagem-multi-tenant.md`](docs/arquitetura/CF-070-modelagem-multi-tenant.md).
  **Somente arquitetura nesta etapa — nenhuma tela foi alterada.**
- ✅ Arrastar um card no Pipeline grava o novo `status` direto no Firestore
- ✅ Editar um briefing (tela de detalhe) grava direto no Firestore
- ✅ Excluir um briefing (tela de detalhe) remove o documento direto no Firestore
- ⏳ Authentication configurado, mas ainda sem uso na interface (próxima etapa)

## Ainda NÃO integrado (propositalmente, por instrução do escopo desta etapa)

- ❌ Chamadas ao Claude a partir do frontend (e nunca deve haver — ver `docs/integracoes/claude.md`)
- ❌ Análise de imagens pelo Claude (o campo é capturado, mas não enviado à IA ainda)
- ❌ Login real via Authentication (a Landing ainda é só uma porta de entrada da demo)
- ❌ Persistência das Configurações da assistente no Firestore (ainda vive só em estado local; o prompt de sistema do workflow também está fixo, não lido de lá)

## Estrutura do projeto

```
vertice-next-ai/
├── public/
│   └── favicon.svg
├── src/
│   ├── firebase/
│   │   └── firebase.ts         # inicialização do Firebase (app, db, auth)
│   ├── services/
│   │   ├── companies.ts        # CRUD básico de empresas (tenants)
│   │   ├── customers.ts        # CRUD de clientes, escopado por companyId
│   │   ├── briefings.ts        # briefing = descoberta (não é mais pedido)
│   │   ├── orders.ts           # pedidos, criados a partir da aprovação de um briefing
│   │   ├── workOrders.ts       # ordens de serviço, criadas a partir de um pedido
│   │   ├── n8n.ts              # aciona o Webhook do n8n para CRIAR briefings
│   │   ├── evolution.ts        # envio via Evolution API (texto/typing/read/imagem)
│   │   └── conversations.ts    # leitura (somente leitura) de `conversations`/`messages`
│   ├── lib/
│   │   ├── derive.js           # estilos + funções derivadas (Clientes/Pipeline/Analytics)
│   │   └── tenant.js           # DEFAULT_COMPANY_ID (multi-tenant)
│   ├── components/              # Sidebar, Header, tabelas, modais, tour guiado, UI base
│   ├── pages/                    # Dashboard, Briefings, Clientes, Agenda, Pipeline, Analytics, Configurações
│   ├── data/
│   │   └── seedBriefings.js    # dados de exemplo (só usados em desenvolvimento)
│   ├── utils/
│   │   └── date.js             # helpers de data (ISO -> exibição em pt-BR)
│   ├── App.jsx                   # orquestração de estado e navegação
│   ├── main.jsx
│   └── index.css
├── workflows/
│   ├── briefing.json             # workflow do n8n: Webhook -> Validar -> Firestore -> JSON
│   └── atendimento-ia.json       # workflow do n8n: Evolution -> Claude -> Firestore -> Dashboard
├── docs/
│   ├── arquitetura/
│   │   └── CF-070-modelagem-multi-tenant.md  # nova modelagem: companies/customers/orders/workOrders
│   └── integracoes/
│       ├── n8n.md               # documentação da integração com o n8n
│       ├── evolution.md         # documentação da integração com a Evolution API
│       └── claude.md            # documentação da integração com o Claude (100% via n8n)
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── .firebaserc
├── netlify.toml
├── .env.example
├── tsconfig.json
└── package.json
```
