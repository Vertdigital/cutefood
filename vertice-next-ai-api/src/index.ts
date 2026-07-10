import { buildApp } from "./app";
import { env } from "./config/env";
import { pool } from "./db/pool";
import { createBriefingsRepository } from "./repositories/briefings.repository";
import { createConversationsRepository } from "./repositories/conversations.repository";

const app = buildApp({
  briefingsRepository: createBriefingsRepository(pool),
  conversationsRepository: createConversationsRepository(pool),
  corsOrigin: env.CORS_ORIGIN,
  logger: true,
});

app
  .listen({ port: env.PORT, host: "0.0.0.0" })
  .then(() => {
    app.log.info(`vertice-next-ai-api ouvindo na porta ${env.PORT}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
