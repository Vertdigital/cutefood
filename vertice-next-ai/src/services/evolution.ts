/**
 * Service de integração com a Evolution API (WhatsApp).
 *
 * Nesta etapa, este service cobre apenas o ENVIO de mensagens/indicadores
 * via Evolution API — texto, "digitando...", confirmação de leitura e
 * imagem. Não há, ainda, nenhuma lógica de resposta automática nem
 * integração com o Claude: essas funções ficam disponíveis para serem
 * chamadas manualmente ou por um workflow do n8n em uma etapa futura.
 *
 * Recebimento de mensagens (inbound):
 * A Evolution API entrega mensagens recebidas via webhook configurado no
 * painel/instância dela — esse webhook deve apontar para um endpoint do
 * n8n (não para o front-end, que roda no navegador e não pode receber
 * webhooks). A criação desse workflow de recebimento fica para uma
 * próxima etapa; ver docs/integracoes/evolution.md.
 *
 * ⚠️ Aviso de segurança: como este é um projeto front-end (Vite), as
 * variáveis VITE_EVOLUTION_* ficam embutidas no bundle JavaScript enviado
 * ao navegador — incluindo a API key. Isso é aceitável para esta fase
 * inicial do projeto piloto, mas NÃO deve ser usado assim em produção com
 * dados reais de clientes. Antes de ir para produção, mova essas chamadas
 * para trás de um backend/n8n (o mesmo padrão já usado em services/n8n.ts
 * para a criação de briefings), para que a API key nunca fique exposta no
 * navegador do usuário final.
 */

const EVOLUTION_URL = import.meta.env.VITE_EVOLUTION_URL;
const EVOLUTION_INSTANCE = import.meta.env.VITE_EVOLUTION_INSTANCE;
const EVOLUTION_API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

export interface EvolutionResponse {
  [key: string]: unknown;
}

function garantirConfiguracao(): void {
  if (!EVOLUTION_URL || !EVOLUTION_INSTANCE || !EVOLUTION_API_KEY) {
    throw new Error(
      "Evolution API não configurada. Preencha VITE_EVOLUTION_URL, VITE_EVOLUTION_INSTANCE e VITE_EVOLUTION_API_KEY no .env (veja .env.example e docs/integracoes/evolution.md)."
    );
  }
}

async function chamarEvolution(caminho: string, body: Record<string, unknown>): Promise<EvolutionResponse> {
  garantirConfiguracao();

  const url = `${EVOLUTION_URL.replace(/\/$/, "")}${caminho}/${EVOLUTION_INSTANCE}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(`Não foi possível conectar à Evolution API em ${url}. Verifique VITE_EVOLUTION_URL e se a instância está ativa.`);
  }

  let corpo: EvolutionResponse | null = null;
  try {
    corpo = await response.json();
  } catch {
    // Resposta sem corpo JSON — segue com corpo nulo.
  }

  if (!response.ok) {
    const mensagem = (corpo && (corpo.message || corpo.error)) || `Falha na chamada à Evolution API (HTTP ${response.status}).`;
    throw new Error(String(mensagem));
  }

  return corpo ?? {};
}

/**
 * Envia uma mensagem de texto simples para um número.
 * @param numero Número no formato internacional, ex: "5541999998888"
 * @param texto Conteúdo da mensagem
 */
export async function sendText(numero: string, texto: string): Promise<EvolutionResponse> {
  return chamarEvolution("/message/sendText", {
    number: numero,
    text: texto,
  });
}

/**
 * Envia o indicador de "digitando..." (presence) para um número.
 * @param numero Número no formato internacional
 * @param duracaoMs Por quanto tempo exibir o indicador antes de parar sozinho (padrão: 1200ms)
 */
export async function sendTyping(numero: string, duracaoMs = 1200): Promise<EvolutionResponse> {
  return chamarEvolution("/chat/sendPresence", {
    number: numero,
    presence: "composing",
    delay: duracaoMs,
  });
}

/**
 * Marca uma ou mais mensagens recebidas como lidas (dois tiquinhos azuis).
 * @param numero Número no formato internacional
 * @param mensagemId ID da mensagem original recebida via webhook da Evolution
 * (essa integração de recebimento ainda não existe nesta etapa — o parâmetro
 * já fica pronto para quando o workflow de entrada for criado).
 */
export async function sendRead(numero: string, mensagemId: string): Promise<EvolutionResponse> {
  return chamarEvolution("/chat/markMessageAsRead", {
    readMessages: [
      {
        remoteJid: `${numero}@s.whatsapp.net`,
        fromMe: false,
        id: mensagemId,
      },
    ],
  });
}

/**
 * Envia uma imagem (por URL ou base64) com legenda opcional.
 * @param numero Número no formato internacional
 * @param media URL pública da imagem ou string base64
 * @param legenda Legenda opcional exibida junto da imagem
 */
export async function sendImage(numero: string, media: string, legenda = ""): Promise<EvolutionResponse> {
  return chamarEvolution("/message/sendMedia", {
    number: numero,
    mediatype: "image",
    media,
    caption: legenda,
  });
}
