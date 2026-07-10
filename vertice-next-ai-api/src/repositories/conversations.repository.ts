import type { Pool } from "pg";
import type { ConversationListQuery } from "../schemas/conversation.schema";

/** Colunas reais de `conversas_cutefood` — usadas explicitamente, sem `SELECT *`. */
const CONVERSATION_COLUMNS = ["number", "historico", "updated_at", "atendimento_humano"].join(", ");

export function createConversationsRepository(pool: Pool) {
  return {
    /** Lista conversas, mais recentemente atualizadas primeiro, com paginação. */
    async findAll(filters: ConversationListQuery) {
      const { rows } = await pool.query(
        `SELECT ${CONVERSATION_COLUMNS}
         FROM conversas_cutefood
         ORDER BY updated_at DESC NULLS LAST
         LIMIT $1 OFFSET $2`,
        [filters.limit, filters.offset]
      );
      return rows;
    },
  };
}

export type ConversationsRepository = ReturnType<typeof createConversationsRepository>;
