/// <reference types="vite/client" />

/**
 * Configuração central do Firebase para o Vértice Next AI.
 *
 * Lê as credenciais do projeto a partir de variáveis de ambiente do Vite
 * (prefixo VITE_), definidas em `.env` — veja `.env.example` na raiz do
 * projeto para a lista completa e instruções no README.
 *
 * Este arquivo expõe três instâncias reutilizáveis em toda a aplicação:
 * - `app`   → instância principal do Firebase App
 * - `db`    → Firestore (banco de dados usado pelos briefings)
 * - `auth`  → Authentication, já configurado e pronto para uso futuro
 *             (login da confeiteira, controle de acesso por tenant, etc.).
 *             Ainda NÃO é utilizado pela interface nesta etapa.
 */

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  // Aviso apenas no console — não bloqueia o build nem a renderização,
  // mas deixa claro por que as chamadas ao Firestore vão falhar sem um
  // arquivo .env configurado corretamente.
  // eslint-disable-next-line no-console
  console.warn(
    "[Vértice Next AI] Variáveis do Firebase não configuradas. Copie .env.example para .env e preencha com as credenciais do seu projeto."
  );
}

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
