import { buildApp } from "../src/app";
import type { BriefingsRepository } from "../src/repositories/briefings.repository";
import type { ConversationsRepository } from "../src/repositories/conversations.repository";

type Overrides = {
  briefingsRepository?: Partial<BriefingsRepository>;
  conversationsRepository?: Partial<ConversationsRepository>;
};

/** Monta o app de teste com repositories fake (sem tocar em banco nenhum). */
export function buildTestApp(overrides: Overrides = {}) {
  const briefingsRepository: BriefingsRepository = {
    findAll: async () => [],
    findById: async () => null,
    ...overrides.briefingsRepository,
  };

  const conversationsRepository: ConversationsRepository = {
    findAll: async () => [],
    ...overrides.conversationsRepository,
  };

  return buildApp({ briefingsRepository, conversationsRepository });
}
