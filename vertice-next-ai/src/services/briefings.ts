/**
 * Service de acesso à coleção `briefings` no Firestore.
 *
 * Esta é a única camada da aplicação que conversa diretamente com o
 * Firestore — as páginas/componentes React não devem importar `firebase/firestore`
 * diretamente, apenas as funções exportadas aqui.
 *
 * ⚠️ MODELAGEM (ver docs/arquitetura/CF-070-modelagem-multi-tenant.md):
 * A partir desta etapa, o `briefing` deixou de representar um pedido.
 * Ele representa apenas a etapa de DESCOBERTA de uma conversa — os dados
 * comerciais (orçamento, entrega) e o ciclo de vida de produção passam a
 * viver em `orders` (services/orders.ts) e `workOrders` (services/workOrders.ts),
 * criados a partir da aprovação manual de um briefing:
 *
 *   Conversa → Briefing → Aprovação Manual → Pedido → Ordem de Serviço
 *
 * Estrutura do documento (coleção `briefings`):
 *   id             string
 *   companyId      string   — tenant ao qual este briefing pertence (obrigatório)
 *   customerId     string   — referência ao cliente em `customers` (obrigatório em novos documentos)
 *   conversationId string   — referência à conversa de origem em `conversations`
 *   cliente        string   — nome do cliente (cache de leitura; fonte de verdade é `customers`)
 *   telefone       string   — telefone do cliente (idem)
 *   evento         string
 *   data           string   — data do evento, formato ISO "AAAA-MM-DD"
 *   tema           string
 *   sabores        string
 *   quantidade     string
 *   referencias    number
 *   observacoes    string
 *   complexidade   string   — "Simples" | "Média" | "Alta"
 *   status         string   — ciclo de vida do BRIEFING em si: "Em coleta" | "Completo" | "Aprovado" | "Rejeitado"
 *   createdAt      Timestamp (gerado pelo servidor)
 *   updatedAt      Timestamp (gerado pelo servidor)
 *
 * Campos LEGADOS mantidos apenas por compatibilidade com a interface atual
 * (Dashboard/Pipeline/Analytics ainda leem `orcamento` e valores de pipeline
 * de pedido em `status`, como "Orçamento"/"Produção"/"Finalizado") — não
 * populamos mais esses valores em novos fluxos; a migração dessas telas
 * para consumir `orders` fica para uma próxima etapa, propositalmente fora
 * do escopo desta ("não alterar layout"):
 *   orcamento     string  (DEPRECATED — usar orders.orcamento)
 *   entrega       string  (DEPRECATED — usar orders.entrega)
 *
 * Campos de extensão (fora do pedido original, mas necessários para a
 * interface já existente — avatar e timeline da conversa):
 *   avatarBg      string opcional
 *   avatarText    string opcional
 *   mensagens     array opcional de { autor, texto, hora } (uso legado —
 *                 conversas reais usam a coleção `messages`, ver services/conversations.ts)
 */

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const COLLECTION = "briefings";

export interface MensagemConversa {
  autor: "cliente" | "ia";
  texto: string;
  hora: string;
}

export interface Briefing {
  id: string;
  companyId: string;
  customerId?: string;
  conversationId?: string;
  cliente: string;
  telefone: string;
  evento: string;
  data: string;
  tema: string;
  sabores: string;
  quantidade: string;
  referencias: number;
  observacoes: string;
  status: string;
  complexidade: string;
  /** @deprecated dado comercial — passa a viver em Order (services/orders.ts) */
  orcamento?: string;
  /** @deprecated dado comercial — passa a viver em Order (services/orders.ts) */
  entrega?: string;
  avatarBg?: string;
  avatarText?: string;
  mensagens?: MensagemConversa[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type NovoBriefing = Omit<Briefing, "id" | "createdAt" | "updatedAt">;

const briefingsRef = collection(db, COLLECTION);

/** Cria um novo briefing e retorna o ID gerado. */
export async function createBriefing(data: NovoBriefing): Promise<string> {
  const ref = doc(briefingsRef);
  await setDoc(ref, {
    ...data,
    id: ref.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Atualiza campos de um briefing existente (atualização parcial). */
export async function updateBriefing(id: string, data: Partial<Briefing>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Remove um briefing permanentemente. */
export async function deleteBriefing(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

/** Busca um único briefing pelo ID. */
export async function getBriefing(id: string): Promise<Briefing | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? (snap.data() as Briefing) : null;
}

/** Busca todos os briefings, mais recentes primeiro (leitura única). */
export async function getBriefings(): Promise<Briefing[]> {
  const q = query(briefingsRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Briefing);
}

/**
 * Assina atualizações em tempo real da coleção — usado pelo Dashboard para
 * refletir mudanças automaticamente (ex.: mover um card no Pipeline em outra
 * aba já aparece atualizado aqui, sem precisar recarregar a página).
 * Retorna uma função de cancelamento da assinatura (chamar no cleanup do useEffect).
 */
export function subscribeBriefings(
  onData: (briefings: Briefing[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(briefingsRef, orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => d.data() as Briefing)),
    (error) => {
      // eslint-disable-next-line no-console
      console.error("[Vértice Next AI] Falha ao ler a coleção 'briefings':", error.message);
      onError?.(error);
    }
  );
}
