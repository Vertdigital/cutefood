import { describe, it, expect, vi } from "vitest";
import { buildTestApp, loginAndGetToken } from "./helpers";

const fakeConversation = {
  number: "5541999998888",
  historico: "Cliente: oi\nClara: Oi! Seja muito bem-vindo(a) à CuteFood CWB!\n",
  updated_at: new Date("2026-07-01T12:00:00.000Z"),
  atendimento_humano: false,
};

const fakeConversationJSON = JSON.parse(JSON.stringify(fakeConversation));

async function authHeader(app: ReturnType<typeof buildTestApp>) {
  const token = await loginAndGetToken(app);
  return { authorization: `Bearer ${token}` };
}

describe("GET /conversations", () => {
  it("retorna a lista vinda do repository", async () => {
    const findAll = vi.fn(async () => [fakeConversation]);
    const app = buildTestApp({ conversationsRepository: { findAll } });
    const headers = await authHeader(app);

    const res = await app.inject({ method: "GET", url: "/conversations", headers });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ data: [fakeConversationJSON] });
    expect(findAll).toHaveBeenCalledWith({ limit: 20, offset: 0 });
  });

  it("repassa limit/offset da query pro repository", async () => {
    const findAll = vi.fn(async () => []);
    const app = buildTestApp({ conversationsRepository: { findAll } });
    const headers = await authHeader(app);

    await app.inject({ method: "GET", url: "/conversations?limit=5&offset=15", headers });

    expect(findAll).toHaveBeenCalledWith({ limit: 5, offset: 15 });
  });

  it("retorna 400 quando offset é inválido", async () => {
    const app = buildTestApp();
    const headers = await authHeader(app);

    const res = await app.inject({ method: "GET", url: "/conversations?offset=-1", headers });

    expect(res.statusCode).toBe(400);
  });
});
