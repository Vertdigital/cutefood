import { z } from "zod";

/**
 * Espelha exatamente as colunas reais da tabela `briefings_cutefood`.
 * Nenhum campo aqui foi inferido — só o que existe de fato no Postgres.
 *
 * Tipos confirmados: `data_evento` é text (não date), `entrega` e
 * `referencia` são boolean.
 */
export const BriefingSchema = z.object({
  id: z.number().int(),
  telefone: z.string(),
  ocasiao: z.string().nullable(),
  data_evento: z.string().nullable(),
  pessoas: z.number().int().nullable(),
  tema: z.string().nullable(),
  sabor: z.string().nullable(),
  entrega: z.boolean().nullable(),
  referencia: z.boolean().nullable(),
  orcamento: z.number().nullable(),
  status: z.string().nullable(),
  created_at: z.coerce.date().nullable(),
  updated_at: z.coerce.date().nullable(),
  atualizado_em: z.coerce.date().nullable(),
  completude_percentual: z.number().nullable(),
});

export type Briefing = z.infer<typeof BriefingSchema>;

/** Parâmetro de rota `:id` — sempre um inteiro positivo. */
export const BriefingIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/** Query string de `GET /briefings` — filtros e paginação, todos opcionais. */
export const BriefingListQuerySchema = z.object({
  status: z.string().optional(),
  telefone: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type BriefingListQuery = z.infer<typeof BriefingListQuerySchema>;
