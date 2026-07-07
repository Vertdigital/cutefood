/**
 * Service da coleção `companies` — o topo da hierarquia multi-tenant.
 * Toda outra coleção (customers, conversations, messages, briefings,
 * orders, workOrders) referencia uma empresa através do campo `companyId`.
 */

import { collection, doc, getDoc, getDocs, setDoc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "../firebase/firebase";

const COLLECTION = "companies";

export interface Company {
  id: string;
  nome: string;
  criadoEm?: unknown;
}

const companiesRef = collection(db, COLLECTION);

/** Cria (ou sobrescreve) uma empresa com um ID específico. */
export async function upsertCompany(id: string, nome: string): Promise<void> {
  await setDoc(doc(db, COLLECTION, id), { nome, criadoEm: new Date().toISOString() }, { merge: true });
}

export async function getCompany(id: string): Promise<Company | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Company, "id">) }) : null;
}

export async function getCompanies(): Promise<Company[]> {
  const snap = await getDocs(companiesRef);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Company, "id">) }));
}

export function subscribeCompany(id: string, onData: (company: Company | null) => void): Unsubscribe {
  return onSnapshot(doc(db, COLLECTION, id), (snap) => onData(snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Company, "id">) }) : null));
}
