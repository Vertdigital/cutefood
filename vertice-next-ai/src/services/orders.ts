/**
 * Service da coleção `orders` (pedidos).
 *
 * Um `order` nasce da **aprovação manual** de um `briefing` — o briefing em
 * si nunca representa um pedido (ver docs/arquitetura/CF-070-modelagem-multi-tenant.md).
 * Campos comerciais (orçamento, entrega) vivem aqui, não no briefing.
 *
 * Fluxo: Conversa → Briefing → Aprovação Manual → Pedido (este arquivo) → Ordem de Serviço.
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
  where,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { updateBriefing, type Briefing } from "./briefings";

const COLLECTION = "orders";

export type OrderStatus = "Aguardando produção" | "Em produção" | "Finalizado" | "Cancelado";

export interface Order {
  id: string;
  companyId: string;
  briefingId: string;
  customerId?: string;
  conversationId?: string;
  evento: string;
  tema: string;
  data: string;
  quantidade: string;
  sabores: string;
  referencias: number;
  complexidade: string;
  orcamento: string;
  entrega: string;
  status: OrderStatus;
  aprovadoEm?: unknown;
  aprovadoPor?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

const ordersRef = collection(db, COLLECTION);

/**
 * Cria um pedido a partir de um briefing já aprovado manualmente, copiando
 * os dados de descoberta (evento, tema, data, quantidade, sabores,
 * complexidade) e recebendo os dados comerciais (orçamento, entrega) que só
 * existem a partir da aprovação. Também marca o briefing de origem como
 * `"Aprovado"`.
 */
export async function createOrderFromBriefing(
  briefing: Briefing,
  dadosComerciais: { orcamento: string; entrega: string; aprovadoPor?: string }
): Promise<string> {
  const ref = doc(ordersRef);
  const novoPedido: Omit<Order, "id"> = {
    companyId: briefing.companyId,
    briefingId: briefing.id,
    customerId: briefing.customerId,
    conversationId: briefing.conversationId,
    evento: briefing.evento,
    tema: briefing.tema,
    data: briefing.data,
    quantidade: briefing.quantidade,
    sabores: briefing.sabores,
    referencias: briefing.referencias,
    complexidade: briefing.complexidade,
    orcamento: dadosComerciais.orcamento,
    entrega: dadosComerciais.entrega,
    status: "Aguardando produção",
    aprovadoEm: serverTimestamp(),
    aprovadoPor: dadosComerciais.aprovadoPor,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, { ...novoPedido, id: ref.id });
  await updateBriefing(briefing.id, { status: "Aprovado" });
  return ref.id;
}

export async function updateOrder(id: string, data: Partial<Order>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteOrder(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getOrder(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Order, "id">) }) : null;
}

export async function getOrders(companyId: string): Promise<Order[]> {
  const q = query(ordersRef, where("companyId", "==", companyId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, "id">) }));
}

export function subscribeOrders(companyId: string, onData: (orders: Order[]) => void, onError?: (error: Error) => void): Unsubscribe {
  const q = query(ordersRef, where("companyId", "==", companyId), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, "id">) }))),
    (error) => onError?.(error)
  );
}
