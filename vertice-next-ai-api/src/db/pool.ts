import { Pool } from "pg";
import { env } from "../config/env";

/**
 * Pool de conexão único com o Postgres. Criado só aqui — nenhum outro
 * arquivo deve instanciar um Pool novo.
 */
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});
