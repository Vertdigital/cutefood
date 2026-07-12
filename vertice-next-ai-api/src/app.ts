import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { registerHealthRoutes } from "./routes/health.routes";
import { registerBriefingsRoutes } from "./routes/briefings.routes";
import { registerConversationsRoutes } from "./routes/conversations.routes";
import { registerAuthRoutes } from "./routes/auth.routes";
import { registerAuth } from "./plugins/auth";
import type { BriefingsRepository } from "./repositories/briefings.repository";
import type { ConversationsRepository } from "./repositories/conversations.repository";

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  adminEmail: string;
  /** Hash bcrypt da senha de admin — nunca a senha em texto puro. */
  adminPasswordHash: string;
}

export interface BuildAppOptions {
  briefingsRepository: BriefingsRepository;
  conversationsRepository: ConversationsRepository;
  auth: AuthConfig;
  corsOrigin?: string;
  logger?: boolean;
}

/**
 * Monta o app Fastify recebendo os repositories e a config de auth já
 * prontos (injeção de dependência simples) em vez de criar o Pool ou ler
 * o .env aqui dentro. Isso permite testar as rotas de ponta a ponta (via
 * `app.inject`) com repositories fake e segredos de teste, sem precisar
 * de um Postgres real nem de variáveis de ambiente — ver test/*.test.ts.
 *
 * Segurança:
 * - Helmet ativo (headers HTTP padrão de segurança).
 * - Rate limit global (100 req/min por IP) + limite mais estrito só no
 *   login (5 req/min por IP), contra brute-force.
 * - CORS restrito à origem configurada (nunca `*` em produção).
 * - /health e /auth/login são as únicas rotas públicas; todo o resto usa
 *   o preHandler `app.authenticate` (ver src/plugins/auth.ts).
 */
export function buildApp(options: BuildAppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });

  app.register(helmet);
  app.register(cors, { origin: options.corsOrigin ?? true });
  app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  registerAuth(app, { jwtSecret: options.auth.jwtSecret });

  registerHealthRoutes(app);
  registerAuthRoutes(app, {
    adminEmail: options.auth.adminEmail,
    adminPasswordHash: options.auth.adminPasswordHash,
    jwtExpiresIn: options.auth.jwtExpiresIn,
  });
  registerBriefingsRoutes(app, options.briefingsRepository);
  registerConversationsRoutes(app, options.conversationsRepository);

  app.setErrorHandler((error, _request, reply) => {
    // Nunca logar corpo da requisição aqui (senha/token não passam por
    // este objeto de erro nas rotas atuais, mas fica documentado o motivo
    // de logarmos só o erro, nunca o request inteiro).
    app.log.error(error);
    reply.status(500).send({ error: "Erro interno no servidor" });
  });

  return app;
}
