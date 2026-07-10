import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { registerHealthRoutes } from "./routes/health.routes";
import { registerBriefingsRoutes } from "./routes/briefings.routes";
import { registerConversationsRoutes } from "./routes/conversations.routes";
import type { BriefingsRepository } from "./repositories/briefings.repository";
import type { ConversationsRepository } from "./repositories/conversations.repository";

export interface BuildAppOptions {
  briefingsRepository: BriefingsRepository;
  conversationsRepository: ConversationsRepository;
  corsOrigin?: string;
  logger?: boolean;
}

/**
 * Monta o app Fastify recebendo os repositories já prontos (injeção de
 * dependência simples) em vez de criar o Pool aqui dentro. Isso permite
 * testar as rotas de ponta a ponta (via `app.inject`) com repositories
 * fake, sem precisar de um Postgres real rodando — ver test/*.test.ts.
 */
export function buildApp(options: BuildAppOptions): FastifyInstance {
  const app = Fastify({ logger: options.logger ?? false });

  app.register(cors, { origin: options.corsOrigin ?? true });

  registerHealthRoutes(app);
  registerBriefingsRoutes(app, options.briefingsRepository);
  registerConversationsRoutes(app, options.conversationsRepository);

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    reply.status(500).send({ error: "Erro interno no servidor" });
  });

  return app;
}
