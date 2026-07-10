import { describe, it, expect, vi } from "vitest";
import { buildTestApp } from "./helpers";

const fakeBriefing = {
  id: 1,
  telefone: "5541999998888",
  ocasiao: "Aniversário infantil",
  data_evento: "2026-11-14",
  pessoas: 25,
  tema: "Safári",
  sabor: "Chocolate com ninho",
  entrega: true,
  referencia: true,
  orcamento: 280,
  status: "aguardando_orcamento",
  created_at: new Date("2026-07-01T12:00:00.000Z"),
  updated_at: new Date("2026-07-01T12:00:00.000Z"),
  atualizado_em: null,
  completude_percentual: 100,
};

// Dates viram string ISO quando serializados como JSON pela resposta HTTP.
const fakeBriefingJSON = JSON.parse(JSON.stringify(fakeBriefing));

describe("GET /briefings", () => {
  it("retorna a lista vinda do repository", async () => {
    const findAll = vi.fn(async () => [fakeBriefing]);
    const app = buildTestApp({ briefingsRepository: { findAll } });

    const res = await app.inject({ method: "GET", url: "/briefings" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [fakeBriefingJSON] });
    expect(findAll).toHaveBeenCalledWith({ limit: 20, offset: 0 });
  });

  it("repassa filtros de status e telefone pro repository", async () => {
    const findAll = vi.fn(async () => []);
    const app = buildTestApp({ briefingsRepository: { findAll } });

    await app.inject({ method: "GET", url: "/briefings?status=aguardando_orcamento&telefone=5541999998888&limit=5&offset=10" });

    expect(findAll).toHaveBeenCalledWith({
      status: "aguardando_orcamento",
      telefone: "5541999998888",
      limit: 5,
      offset: 10,
    });
  });

  it("retorna 400 quando limit não é um número válido", async () => {
    const app = buildTestApp();
    const res = await app.inject({ method: "GET", url: "/briefings?limit=abc" });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBeDefined();
  });
});

describe("GET /briefings/:id", () => {
  it("retorna o briefing quando existe", async () => {
    const findById = vi.fn(async (id: number) => (id === 1 ? fakeBriefing : null));
    const app = buildTestApp({ briefingsRepository: { findById } });

    const res = await app.inject({ method: "GET", url: "/briefings/1" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: fakeBriefingJSON });
    expect(findById).toHaveBeenCalledWith(1);
  });

  it("retorna 404 quando não existe", async () => {
    const app = buildTestApp({ briefingsRepository: { findById: async () => null } });

    const res = await app.inject({ method: "GET", url: "/briefings/999" });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: "Briefing não encontrado" });
  });

  it("retorna 400 quando :id não é numérico", async () => {
    const app = buildTestApp();
    const res = await app.inject({ method: "GET", url: "/briefings/abc" });

    expect(res.statusCode).toBe(400);
  });
});
