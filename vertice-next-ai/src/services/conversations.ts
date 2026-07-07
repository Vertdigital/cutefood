/**
 * Service de leitura das coleções `conversations` e `messages`.
 *
 * Este service é **somente leitura** — o frontend nunca grava nessas
 * coleções. Quem grava é exclusivamente o workflow "Atendimento IA"
 * (workflows/atendimento-ia.json), rodando no n8n. Ver docs/integracoes/claude.md.
 *
 * O frontend só ouve o Firestore (onSnapshot) e exibe: mensagens da
 * conversa e o briefing correspondente.
 *
 * Multi-tenant (ver docs/arquitetura/CF-070-modelagem-multi-tenant.md):
 * toda `conversation` e `message` carrega um `companyId`. Como o ID do
 * documento de conversa é derivado do telefone, e o mesmo telefone pode,
 * em teoria, existir em mais de uma empresa, o ID de documento passa a ser
 * `${companyId}_${telefone}` — não mais o telefone puro.
 */

import { collection, query, where, orderBy, onSnapshot, doc, type Unsubscribe } from "firebase/firestore";
import { db } from "../firebase/firebase";

export interface Mensagem {
  id: string;
  companyId: string;
  conversationId: string;
  autor: "cliente" | "ia";
  texto: string;
  hora: string;
  createdAt?: unknown;
}

export interface Conversa {
  id: string;
  companyId: string;
  customerId?: string;
  telefone: string;
  cliente: string;
  briefingId?: string;
  ultimaMensagem?: string;
  status?: string;
  updatedAt?: unknown;
}

/**
 * Assina, em tempo real, as mensagens de uma conversa (ordenadas por
 * criação). Retorna a função de cancelamento da assinatura.
 */
export function subscribeMessages(conversationId: string, onData: (mensagens: Mensagem[]) => void, onError?: (error: Error) => void): Unsubscribe {
  const q = query(collection(db, "messages"), where("conversationId", "==", conversationId), orderBy("createdAt", "asc"));

  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Mensagem, "id">) }))),
    (error) => {
      // eslint-disable-next-line no-console
      console.error("[Vértice Next AI] Falha ao ler a coleção 'messages':", error.message);
      onError?.(error);
    }
  );
}

/** Assina, em tempo real, o documento de uma conversa específica. */
export function subscribeConversation(conversationId: string, onData: (conversa: Conversa | null) => void, onError?: (error: Error) => void): Unsubscribe {
  return onSnapshot(
    doc(db, "conversations", conversationId),
    (snap) => onData(snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Conversa, "id">) }) : null),
    (error) => {
      // eslint-disable-next-line no-console
      console.error("[Vértice Next AI] Falha ao ler a coleção 'conversations':", error.message);
      onError?.(error);
    }
  );
}
