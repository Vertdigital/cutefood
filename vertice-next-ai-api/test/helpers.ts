import bcrypt from "bcryptjs";
import { buildApp, type AuthConfig } from "../src/app";
import type { BriefingsRepository } from "../src/repositories/briefings.repository";
import type { ConversationsRepository } from "../src/repositories/conversations.repository";

type Overrides = {
  briefingsRepository?: Partial<BriefingsRepository>;
  conversationsRepository?: Partial<ConversationsRepository>;
  auth?: Partial<AuthConfig>;
};

export const TEST_ADMIN_EMAIL = "admin@teste.com";
export const TEST_ADMIN_PASSWORD = "senha-correta-123";
export const TEST_JWT_SECRET = "segredo-de-teste-bem-longo-1234567890";

/** Monta o app de teste com repositories fake e credenciais de teste (sem tocar em banco nenhum). */
export function buildTestApp(overrides: Overrides = {}) {
  const briefingsRepository: BriefingsRepository = {
    findAll: async () => [],
    findById: async () => null,
    ...overrides.briefingsRepository,
  };

  const conversationsRepository: ConversationsRepository = {
    findAll: async () => [],
    ...overrides.conversationsRepository,
  };

  const auth: AuthConfig = {
    jwtSecret: TEST_JWT_SECRET,
    jwtExpiresIn: "1h",
    adminEmail: TEST_ADMIN_EMAIL,
    adminPasswordHash: bcrypt.hashSync(TEST_ADMIN_PASSWORD, 10),
    ...overrides.auth,
  };

  return buildApp({ briefingsRepository, conversationsRepository, auth });
}

/** Loga com as credenciais de teste válidas e devolve o token JWT emitido. */
export async function loginAndGetToken(app: ReturnType<typeof buildTestApp>): Promise<string> {
  const res = await app.inject({
    method: "POST",
    url: "/auth/login",
    payload: { email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD },
  });
  const body = res.json();
  return body.token;
}
