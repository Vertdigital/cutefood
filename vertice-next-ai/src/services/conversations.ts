/**
 * Service de leitura das coleções `conversations` e `messages`.
 *
 * Este service é **somente leitura**, com uma única exceção: pausar ou
 * reativar o atendimento automático da IA (campo `atendimentoHumano`),
 * via `setAtendimentoHumano`. Fora essa exceção, quem grava é
 * exclusivamente o workflow "Atendimento IA" (workflows/atendimento-ia.json),
 * rodando no n8n. Ver docs/integracoes/claude.md.
 *
 * O frontend só ouve o Firestore (onSnapshot) e exibe: mensagens da
 * conversa e o briefing correspondente — e pode alternar `atendimentoHumano`
 * quando a proprietária decide assumir ou devolver a conversa para a IA
 * (HUMAN-001).
 *
 * Multi-tenant (ver docs/arquitetura/CF-070-modelagem-multi-tenant.md):
 * toda `conversation` e `message` carrega um `companyId`. Como o ID do
 * documento de conversa é derivado do telefone, e o mesmo telefone pode,
 * em teoria, existir em mais de uma empresa, o ID de documento passa a ser
 * `${companyId}_${telefone}` — não mais o telefone puro.
 */

import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, type Unsubscribe } from "firebase/firestore";
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
  /** true quando a proprietária assumiu o atendimento manualmente (IA pausada para esta conversa). */
  atendimentoHumano?: boolean;
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

/**
 * HUMAN-001 — Pausa ou reativa o atendimento automático da IA para uma
 * conversa específica. É a única escrita que o frontend faz nas coleções
 * deste arquivo: altera exclusivamente o campo `atendimentoHumano` (via
 * `updateDoc`, atualização parcial), sem tocar em nenhum outro campo do
 * documento — os demais continuam sendo gravados só pelo n8n.
 *
 * O workflow "Atendimento IA" deve checar este campo antes de chamar o
 * Claude: se `true`, não responder automaticamente.
 */
export async function setAtendimentoHumano(conversationId: string, valor: boolean): Promise<void> {
  await updateDoc(doc(db, "conversations", conversationId), { atendimentoHumano: valor });
}
