// Suporte a multi-tenant: toda leitura/escrita no Firestore precisa ser
// escopada por `companyId`. Enquanto não existe autenticação/seleção real
// de empresa na interface (ver Authentication em src/firebase/firebase.ts),
// usamos uma empresa padrão única — a CuteFood CWB, projeto piloto — vinda
// de variável de ambiente, com um fallback explícito para desenvolvimento.
//
// Quando o login real for implementado, este valor deve vir da sessão do
// usuário autenticado (ex.: claim customizado do Firebase Auth), não mais
// de uma variável de ambiente fixa.

export const DEFAULT_COMPANY_ID = import.meta.env.VITE_DEFAULT_COMPANY_ID || "cutefood-cwb";
