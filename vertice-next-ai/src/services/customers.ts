/**
 * Service da coleção `customers` (clientes finais de uma empresa).
 * Toda leitura/escrita é escopada por `companyId` — nenhum documento desta
 * coleção deve existir sem esse campo.
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

const COLLECTION = "customers";

export interface Customer {
  id: string;
  companyId: string;
  nome: string;
  telefone: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type NovoCustomer = Omit<Customer, "id" | "createdAt" | "updatedAt">;

const customersRef = collection(db, COLLECTION);

export async function createCustomer(data: NovoCustomer): Promise<string> {
  const ref = doc(customersRef);
  await setDoc(ref, { ...data, id: ref.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return ref.id;
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteCustomer(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Customer, "id">) }) : null;
}

export async function getCustomers(companyId: string): Promise<Customer[]> {
  const q = query(customersRef, where("companyId", "==", companyId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Customer, "id">) }));
}

export function subscribeCustomers(companyId: string, onData: (customers: Customer[]) => void, onError?: (error: Error) => void): Unsubscribe {
  const q = query(customersRef, where("companyId", "==", companyId), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Customer, "id">) }))),
    (error) => onError?.(error)
  );
}
