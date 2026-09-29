import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/me/route";
import { call, newGuest } from "../helpers";

describe("GET /api/me", () => {
  it("returns 401 without a guest cookie", async () => {
    const res = await call(GET, { url: "/api/me" });

    expect(res.status).toBe(401);
    expect(res.json.error.code).toBe("UNAUTHORIZED");
  });

  it("returns the guest shape and creates a user row on first call", async () => {
    const guest = newGuest();

    const res = await call(GET, { url: "/api/me", guest });

    expect(res.status).toBe(200);
    expect(res.json.data).toEqual({
      id: guest,
      isGuest: true,
      name: null,
      email: null,
      image: null,
    });
  });

  it("returns the same user on a second call instead of creating another row", async () => {
    const guest = newGuest();

    const first = await call(GET, { url: "/api/me", guest });
    const second = await call(GET, { url: "/api/me", guest });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.json.data).toEqual(first.json.data);
  });
});
