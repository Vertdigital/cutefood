import type { FastifyInstance } from "fastify";
import type { BriefingsRepository } from "../repositories/briefings.repository";
import { BriefingIdParamSchema, BriefingListQuerySchema } from "../schemas/briefing.schema";

export function registerBriefingsRoutes(app: FastifyInstance, repository: BriefingsRepository) {
  app.get("/briefings", { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsedQuery = BriefingListQuerySchema.safeParse(request.query);
    if (!parsedQuery.success) {
      return reply.status(400).send({
        error: "Parâmetros de busca inválidos",
        detalhes: parsedQuery.error.flatten(),
      });
    }

    const briefings = await repository.findAll(parsedQuery.data);
    return { data: briefings };
  });

  app.get("/briefings/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsedParams = BriefingIdParamSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.status(400).send({
        error: "Parâmetro 'id' inválido",
        detalhes: parsedParams.error.flatten(),
      });
    }

    const briefing = await repository.findById(parsedParams.data.id);
    if (!briefing) {
      return reply.status(404).send({ error: "Briefing não encontrado" });
    }

    return { data: briefing };
  });
}
