import "dotenv/config";
import { z } from "zod";

/**
 * Valida as variáveis de ambiente na inicialização — falha rápido e com
 * mensagem clara se algo obrigatório estiver faltando, em vez de deixar
 * o erro aparecer só quando alguma rota tentar usar o valor.
 */
const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  // Autenticação (login simples, credenciais temporárias de um único admin).
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL precisa ser um e-mail válido"),
  ADMIN_PASSWORD: z.string().min(1, "ADMIN_PASSWORD é obrigatória"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET precisa ter pelo menos 16 caracteres"),
  JWT_EXPIRES_IN: z.string().default("1h"),
});

export const env = EnvSchema.parse(process.env);
