import type { FastifyInstance } from "fastify";
import type { ConversationsRepository } from "../repositories/conversations.repository";
import { ConversationListQuerySchema } from "../schemas/conversation.schema";

export function registerConversationsRoutes(app: FastifyInstance, repository: ConversationsRepository) {
  app.get("/conversations", { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsedQuery = ConversationListQuerySchema.safeParse(request.query);
    if (!parsedQuery.success) {
      return reply.status(400).send({
        error: "Parâmetros de busca inválidos",
        detalhes: parsedQuery.error.flatten(),
      });
    }

    const conversations = await repository.findAll(parsedQuery.data);
    return { data: conversations };
  });
}
