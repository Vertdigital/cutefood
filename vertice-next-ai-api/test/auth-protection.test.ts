import { describe, it, expect } from "vitest";
import { buildTestApp, loginAndGetToken } from "./helpers";

describe("proteção JWT nas rotas privadas", () => {
  it("retorna 401 ao acessar /briefings sem token", async () => {
    const app = buildTestApp();
    const res = await app.inject({ method: "GET", url: "/briefings" });

    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({ error: "Token não fornecido" });
  });

  it("retorna 401 ao acessar /briefings/:id sem token", async () => {
    const app = buildTestApp();
    const res = await app.inject({ method: "GET", url: "/briefings/1" });
    expect(res.statusCode).toBe(401);
  });

  it("retorna 401 ao acessar /conversations sem token", async () => {
    const app = buildTestApp();
    const res = await app.inject({ method: "GET", url: "/conversations" });
    expect(res.statusCode).toBe(401);
  });

  it("permite acesso a /briefings com token válido", async () => {
    const app = buildTestApp();
    const token = await loginAndGetToken(app);

    const res = await app.inject({
      method: "GET",
      url: "/briefings",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
  });

  it("retorna 403 com token inválido", async () => {
    const app = buildTestApp();
    const res = await app.inject({
      method: "GET",
      url: "/briefings",
      headers: { authorization: "Bearer token-invalido-qualquer" },
    });

    expect(res.statusCode).toBe(403);
    expect(res.json()).toEqual({ error: "Token inválido ou expirado" });
  });

  it("retorna 403 com token expirado", async () => {
    const app = buildTestApp();
    await app.ready();

    // Assina um token já vencido (expira 10s "atrás") com o mesmo segredo
    // do app, via app.jwt (decorado pelo @fastify/jwt).
    const expiredToken = app.jwt.sign({ email: "admin@teste.com" }, { expiresIn: "-10s" });

    const res = await app.inject({
      method: "GET",
      url: "/briefings",
      headers: { authorization: `Bearer ${expiredToken}` },
    });

    expect(res.statusCode).toBe(403);
  });
});
