# vertice-next-ai-api

API de leitura (Fase 1) sobre o Postgres existente do fluxo "Atendimento IA"
da CuteFood CWB. Backend separado do painel `vertice-next-ai` (que continua
lendo Firestore) — esta API expõe as tabelas `briefings_cutefood` e
`conversas_cutefood` via HTTP.

## Escopo desta fase

Somente leitura. Sem `PATCH`, sem `DELETE`, sem criação de tabelas ou
migrations — o banco usado é exatamente o que já existe em produção,
sem nenhuma alteração de schema.

## Stack

Fastify + TypeScript, `pg` (node-postgres) com SQL parametrizado (sem ORM,
sem `SELECT *`), validação de entrada com Zod, testes com Vitest usando
`app.inject()` do Fastify (não precisa de banco real rodando para testar).

## Setup

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL com as credenciais reais
npm run build
npm test
npm run dev             # ambiente de desenvolvimento (tsx watch)
npm start                # roda o build de dist/
```

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `PORT` | Porta HTTP do servidor (padrão 3001) |
| `DATABASE_URL` | Connection string do Postgres |
| `NODE_ENV` | `development` \| `test` \| `production` |
| `CORS_ORIGIN` | Origem permitida por CORS (painel frontend) |

## Endpoints (Fase 1)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Healthcheck simples |
| GET | `/briefings` | Lista briefings (`?status=&telefone=&limit=&offset=`) |
| GET | `/briefings/:id` | Busca um briefing pelo id |
| GET | `/conversations` | Lista conversas (`?limit=&offset=`) |

Nenhuma escrita (`PATCH`/`DELETE`) existe nesta fase — fica para uma
próxima etapa, com aprovação explícita antes de implementar.

## Estrutura

```
src/
  app.ts              # monta o Fastify app (rotas + repositories injetados)
  index.ts            # bootstrap real: cria o Pool e sobe o servidor
  config/env.ts       # valida variáveis de ambiente com Zod
  db/pool.ts          # Pool único de conexão com o Postgres
  schemas/            # schemas Zod — espelham exatamente as colunas reais
  repositories/       # SQL parametrizado, sem SELECT *
  routes/             # handlers HTTP, validam entrada com os schemas
test/                 # testes de rota via app.inject(), com repositories fake
```
