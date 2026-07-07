/**
 * Service da coleção `workOrders` (ordens de serviço).
 *
 * Uma `workOrder` nasce de um `order` (pedido) já aprovado, representando o
 * acompanhamento da produção em si. Fluxo completo:
 * Conversa → Briefing → Aprovação Manual → Pedido → Ordem de Serviço (este arquivo).
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
import { updateOrder, type Order } from "./orders";

const COLLECTION = "workOrders";

export type WorkOrderStatus = "Pendente" | "Em produção" | "Concluída";

export interface WorkOrder {
  id: string;
  companyId: string;
  orderId: string;
  status: WorkOrderStatus;
  responsavel?: string;
  observacoesProducao?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

const workOrdersRef = collection(db, COLLECTION);

/** Cria uma ordem de serviço a partir de um pedido e marca o pedido como "Em produção". */
export async function createWorkOrderFromOrder(order: Order, responsavel?: string): Promise<string> {
  const ref = doc(workOrdersRef);
  const novaOS: Omit<WorkOrder, "id"> = {
    companyId: order.companyId,
    orderId: order.id,
    status: "Pendente",
    responsavel,
    observacoesProducao: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, { ...novaOS, id: ref.id });
  await updateOrder(order.id, { status: "Em produção" });
  return ref.id;
}

export async function updateWorkOrder(id: string, data: Partial<WorkOrder>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteWorkOrder(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getWorkOrder(id: string): Promise<WorkOrder | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<WorkOrder, "id">) }) : null;
}

export async function getWorkOrders(companyId: string): Promise<WorkOrder[]> {
  const q = query(workOrdersRef, where("companyId", "==", companyId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WorkOrder, "id">) }));
}

export function subscribeWorkOrders(companyId: string, onData: (workOrders: WorkOrder[]) => void, onError?: (error: Error) => void): Unsubscribe {
  const q = query(workOrdersRef, where("companyId", "==", companyId), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WorkOrder, "id">) }))),
    (error) => onError?.(error)
  );
}
