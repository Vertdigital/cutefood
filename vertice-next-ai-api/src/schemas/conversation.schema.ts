import { z } from "zod";

/**
 * Espelha exatamente as colunas reais da tabela `conversas_cutefood`.
 */
export const ConversationSchema = z.object({
  number: z.string(),
  historico: z.string().nullable(),
  updated_at: z.coerce.date().nullable(),
  atendimento_humano: z.boolean(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

/** Query string de `GET /conversations` — só paginação nesta fase. */
export const ConversationListQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ConversationListQuery = z.infer<typeof ConversationListQuerySchema>;
