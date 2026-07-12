import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export interface AuthPluginOptions {
  jwtSecret: string;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { email: string };
    user: { email: string };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

/**
 * Registra o @fastify/jwt e decora a instância com `authenticate` — um
 * preHandler que as rotas protegidas usam explicitamente (sem hook global),
 * assim /health e /auth/login continuam públicos por padrão, sem precisar
 * de nenhuma lista de exceção.
 *
 * Distingue os dois casos pedidos:
 * - sem header Authorization       -> 401
 * - token presente mas inválido/expirado -> 403
 */
export function registerAuth(app: FastifyInstance, options: AuthPluginOptions): void {
  app.register(fastifyJwt, {
    secret: options.jwtSecret,
  });

  app.decorate("authenticate", async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    if (!request.headers.authorization) {
      reply.status(401).send({ error: "Token não fornecido" });
      return;
    }
    try {
      await request.jwtVerify();
    } catch {
      reply.status(403).send({ error: "Token inválido ou expirado" });
    }
  });
}
