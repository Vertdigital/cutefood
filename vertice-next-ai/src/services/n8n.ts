/**
 * Service de integração com o n8n.
 *
 * A partir desta etapa, a CRIAÇÃO de um novo briefing não grava mais
 * diretamente no Firestore a partir do front-end. Em vez disso, o front-end
 * chama o Webhook do workflow `workflows/briefing.json`, publicado no n8n,
 * que valida os dados, grava no Firestore e devolve um JSON de confirmação.
 *
 * Fluxo completo:
 *   Frontend → Webhook do n8n → validação → Firestore → resposta JSON
 *   Frontend, então, apenas escuta a coleção via onSnapshot (services/briefings.ts)
 *   para refletir o novo documento em tempo real.
 *
 * Edição, exclusão e mudança de status (Pipeline) NÃO passam pelo n8n nesta
 * etapa — continuam indo direto ao Firestore via services/briefings.ts.
 */

export interface MensagemConversaPayload {
  autor: "cliente" | "ia";
  texto: string;
  hora: string;
}

export interface NovoBriefingPayload {
  cliente: string;
  telefone: string;
  evento: string;
  data: string; // formato ISO "AAAA-MM-DD"
  tema: string;
  sabores: string;
  quantidade: string;
  orcamento: string;
  entrega: string;
  referencias: number;
  observacoes: string;
  status: string;
  complexidade: string;
  avatarBg?: string;
  avatarText?: string;
  mensagens?: MensagemConversaPayload[];
}

export interface N8nBriefingResponse {
  success: boolean;
  id?: string;
  error?: string;
  erros?: string[];
}

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

/**
 * Aciona o workflow do n8n para criar um novo briefing.
 * Lança um erro com mensagem legível quando a URL não está configurada,
 * quando a chamada de rede falha, ou quando o workflow responde com erro
 * de validação.
 */
export async function createBriefingFromWebhook(payload: NovoBriefingPayload): Promise<N8nBriefingResponse> {
  if (!WEBHOOK_URL) {
    throw new Error(
      "VITE_N8N_WEBHOOK_URL não configurada. Copie .env.example para .env e preencha com a URL do Webhook do workflow (veja docs/integracoes/n8n.md)."
    );
  }

  let response: Response;
  try {
    response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Não foi possível conectar ao Webhook do n8n. Verifique se o workflow está ativo e a URL em .env está correta.");
  }

  let corpo: N8nBriefingResponse | null = null;
  try {
    corpo = await response.json();
  } catch {
    // Resposta sem corpo JSON — segue com corpo nulo, tratado abaixo.
  }

  if (!response.ok || !corpo?.success) {
    const detalhes = corpo?.erros?.join(" | ");
    const mensagem = corpo?.error || `Falha ao criar o briefing via n8n (HTTP ${response.status}).`;
    throw new Error(detalhes ? `${mensagem} ${detalhes}` : mensagem);
  }

  return corpo;
}
