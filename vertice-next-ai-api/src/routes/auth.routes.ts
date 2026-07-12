import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { LoginBodySchema } from "../schemas/auth.schema";

export interface AuthRouteOptions {
  adminEmail: string;
  /** Hash bcrypt da senha de admin — nunca a senha em texto puro. */
  adminPasswordHash: string;
  jwtExpiresIn: string;
}

export function registerAuthRoutes(app: FastifyInstance, options: AuthRouteOptions) {
  app.post(
    "/auth/login",
    {
      // Rate limit mais estrito que o global, específico contra brute-force de login.
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
    },
    async (request, reply) => {
      const parsed = LoginBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: "Credenciais inválidas" });
      }

      const { email, password } = parsed.data;
      const emailMatches = email === options.adminEmail;
      const passwordMatches = await bcrypt.compare(password, options.adminPasswordHash);

      if (!emailMatches || !passwordMatches) {
        return reply.status(401).send({ error: "Credenciais inválidas" });
      }

      const token = await reply.jwtSign({ email }, { expiresIn: options.jwtExpiresIn });
      return { token };
    }
  );
}
