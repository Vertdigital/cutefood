import bcrypt from "bcryptjs";
import { buildApp } from "./app";
import { env } from "./config/env";
import { pool } from "./db/pool";
import { createBriefingsRepository } from "./repositories/briefings.repository";
import { createConversationsRepository } from "./repositories/conversations.repository";

// Hash calculado uma vez, na subida do processo — nunca guardamos nem
// logamos ADMIN_PASSWORD em texto puro depois deste ponto.
const adminPasswordHash = bcrypt.hashSync(env.ADMIN_PASSWORD, 10);

const app = buildApp({
  briefingsRepository: createBriefingsRepository(pool),
  conversationsRepository: createConversationsRepository(pool),
  corsOrigin: env.CORS_ORIGIN,
  logger: true,
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    adminEmail: env.ADMIN_EMAIL,
    adminPasswordHash,
  },
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
