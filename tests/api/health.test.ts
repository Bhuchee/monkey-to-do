import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/health/route";
import { call } from "../helpers";

describe("GET /api/health", () => {
  it("returns ok status and db ok with no cookie required", async () => {
    const res = await call(GET, { url: "/api/health" });

    expect(res.status).toBe(200);
    expect(res.json).toEqual({ data: { status: "ok", db: "ok" } });
  });
});
