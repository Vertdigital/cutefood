# Integração com a Evolution API — WhatsApp

## Índice
1. [Visão Geral](#visão-geral)
2. [Fluxo Completo (visão de destino)](#fluxo-completo-visão-de-destino)
3. [Escopo desta Etapa](#escopo-desta-etapa)
4. [Variáveis de Ambiente](#variáveis-de-ambiente)
5. [Service do Frontend](#service-do-frontend)
6. [Funções Disponíveis](#funções-disponíveis)
7. [Recebimento de Mensagens (Inbound)](#recebimento-de-mensagens-inbound)
8. [Aviso de Segurança](#aviso-de-segurança)
9. [O que NÃO está integrado ainda](#o-que-não-está-integrado-ainda)

---

## Visão Geral

A Evolution API é a camada que conecta o WhatsApp real ao restante da plataforma Vértice Next AI. Esta etapa cobre apenas o **envio** de mensagens e indicadores (texto, "digitando...", confirmação de leitura, imagem) a partir de um service dedicado — sem nenhuma lógica de resposta automática ou de IA ainda.

## Fluxo Completo (visão de destino)

Este é o fluxo para o qual a plataforma está sendo preparada — **ainda não está todo implementado**:

```
WhatsApp
  ↓
Evolution API
  ↓
Webhook n8n
  ↓
Claude
  ↓
Firestore
  ↓
Dashboard
```

## Escopo desta Etapa

- ✅ `src/services/evolution.ts` criado, com `sendText`, `sendTyping`, `sendRead` e `sendImage`.
- ✅ Variáveis de ambiente da Evolution configuradas em `.env.example`.
- ✅ Estrutura pronta para a próxima etapa (recebimento de mensagens + Claude).
- ❌ **Nenhuma** mensagem é respondida automaticamente ainda.
- ❌ **Nenhuma** integração com Claude ainda.
- ❌ **Nenhum** workflow de recebimento (inbound) foi criado ainda — apenas o envio existe nesta etapa.

## Variáveis de Ambiente

```bash
VITE_EVOLUTION_URL=https://sua-evolution-api.exemplo.com
VITE_EVOLUTION_INSTANCE=nome-da-instancia
VITE_EVOLUTION_API_KEY=sua-api-key
```

- `VITE_EVOLUTION_URL`: URL base da sua instalação da Evolution API (sem barra no final, ou com — o service normaliza isso).
- `VITE_EVOLUTION_INSTANCE`: nome da instância configurada na Evolution (cada instância representa uma conexão de WhatsApp).
- `VITE_EVOLUTION_API_KEY`: chave de autenticação da instância, enviada no header `apikey`.

## Service do Frontend

`src/services/evolution.ts` centraliza toda comunicação com a Evolution API. Nenhum outro arquivo do projeto deve chamar a Evolution diretamente — isso mantém um único ponto de manutenção caso os endpoints mudem de versão.

## Funções Disponíveis

| Função | Endpoint chamado | Descrição |
|---|---|---|
| `sendText(numero, texto)` | `POST /message/sendText/{instance}` | Envia uma mensagem de texto simples |
| `sendTyping(numero, duracaoMs?)` | `POST /chat/sendPresence/{instance}` | Exibe o indicador "digitando..." por um tempo (padrão 1200ms) |
| `sendRead(numero, mensagemId)` | `POST /chat/markMessageAsRead/{instance}` | Marca uma mensagem recebida como lida |
| `sendImage(numero, media, legenda?)` | `POST /message/sendMedia/{instance}` | Envia uma imagem (URL ou base64) com legenda opcional |

Todos os números devem estar no formato internacional, sem símbolos (ex: `5541999998888`).

> **Nota de compatibilidade:** os caminhos e formatos de corpo (`body`) acima seguem a convenção mais comum das versões recentes da Evolution API. Como o projeto é open-source e evolui rapidamente, **confira a documentação da versão específica que você está rodando** antes de usar em produção — pequenas diferenças de payload entre versões são possíveis.

Exemplo de uso:

```ts
import { sendText, sendTyping } from "../services/evolution";

await sendTyping("5541999998888");
await sendText("5541999998888", "Olá! Em breve alguém te retorna por aqui 💛");
```

## Recebimento de Mensagens (Inbound)

Mensagens recebidas no WhatsApp chegam à Evolution API, que as repassa via **webhook** configurado na própria instância. Esse webhook deve apontar para um endpoint público — ou seja, **para o n8n, nunca para o front-end** (o front-end roda no navegador do usuário e não tem endereço público capaz de receber webhooks).

O workflow de recebimento (`Evolution → Webhook n8n → Claude → Firestore`) ainda não foi criado — isso fica para a próxima etapa, quando o Claude também for integrado.

## Aviso de Segurança

Como este é um projeto front-end (Vite), toda variável `VITE_*` — incluindo `VITE_EVOLUTION_API_KEY` — fica **embutida no JavaScript enviado ao navegador**. Qualquer pessoa pode abrir as ferramentas de desenvolvedor do navegador e ler essa chave.

Isso é aceitável **apenas** nesta fase de prototipagem/demonstração. Antes de operar com clientes reais, mova as chamadas à Evolution API para trás de um backend ou de um workflow do n8n (mesmo padrão já adotado em `services/n8n.ts` para a criação de briefings), garantindo que a API key nunca fique exposta no navegador do usuário final.

## O que NÃO está integrado ainda

- ❌ Recebimento de mensagens (webhook inbound)
- ❌ Claude (a IA que efetivamente conduz a conversa)
- ❌ Qualquer resposta automática a mensagens do WhatsApp

Essas integrações ficam para as próximas etapas, fora do escopo deste documento.
