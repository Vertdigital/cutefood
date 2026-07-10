import type { Pool } from "pg";
import type { BriefingListQuery } from "../schemas/briefing.schema";

/**
 * Lista de colunas reais de `briefings_cutefood`, usada explicitamente em
 * todo SELECT — nunca `SELECT *`, pra deixar claro (e travado em código)
 * exatamente quais campos esta API expõe.
 */
const BRIEFING_COLUMNS = [
  "id",
  "telefone",
  "ocasiao",
  "data_evento",
  "pessoas",
  "tema",
  "sabor",
  "entrega",
  "referencia",
  "orcamento",
  "status",
  "created_at",
  "updated_at",
  "atualizado_em",
  "completude_percentual",
].join(", ");

export function createBriefingsRepository(pool: Pool) {
  return {
    /** Lista briefings, mais recentes primeiro, com filtros e paginação opcionais. */
    async findAll(filters: BriefingListQuery) {
      const conditions: string[] = [];
      const values: unknown[] = [];

      if (filters.status) {
        values.push(filters.status);
        conditions.push(`status = $${values.length}`);
      }
      if (filters.telefone) {
        values.push(filters.telefone);
        conditions.push(`telefone = $${values.length}`);
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      values.push(filters.limit);
      const limitIndex = values.length;
      values.push(filters.offset);
      const offsetIndex = values.length;

      const { rows } = await pool.query(
        `SELECT ${BRIEFING_COLUMNS}
         FROM briefings_cutefood
         ${where}
         ORDER BY created_at DESC NULLS LAST
         LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
        values
      );
      return rows;
    },

    /** Busca um briefing pelo id. Retorna `null` se não existir. */
    async findById(id: number) {
      const { rows } = await pool.query(
        `SELECT ${BRIEFING_COLUMNS} FROM briefings_cutefood WHERE id = $1`,
        [id]
      );
      return rows[0] ?? null;
    },
  };
}

export type BriefingsRepository = ReturnType<typeof createBriefingsRepository>;
