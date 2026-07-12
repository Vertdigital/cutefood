import { describe, it, expect } from "vitest";
import { buildTestApp, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from "./helpers";

describe("POST /auth/login", () => {
  it("retorna um token com credenciais válidas", async () => {
    const app = buildTestApp();
    const res = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(typeof body.token).toBe("string");
    expect(body.token.length).toBeGreaterThan(10);
  });

  it("retorna 401 com senha errada", async () => {
    const app = buildTestApp();
    const res = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: TEST_ADMIN_EMAIL, password: "senha-errada" },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({ error: "Credenciais inválidas" });
  });

  it("retorna 401 com e-mail errado", async () => {
    const app = buildTestApp();
    const res = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "outro@teste.com", password: TEST_ADMIN_PASSWORD },
    });

    expect(res.statusCode).toBe(401);
  });

  it("retorna 400 com corpo inválido", async () => {
    const app = buildTestApp();
    const res = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "não-é-email" },
    });

    expect(res.statusCode).toBe(400);
  });
});
