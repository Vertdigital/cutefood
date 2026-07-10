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
});

export const env = EnvSchema.parse(process.env);
