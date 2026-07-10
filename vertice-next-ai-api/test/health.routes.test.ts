import { describe, it, expect } from "vitest";
import { buildTestApp } from "./helpers";

describe("GET /health", () => {
  it("retorna status ok", async () => {
    const app = buildTestApp();
    const res = await app.inject({ method: "GET", url: "/health" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });
});
