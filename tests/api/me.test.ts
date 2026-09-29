import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/me/route";
import { db } from "@/db";
import { users } from "@/db/schema";
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

  it("returns 401 when the cookie is not a valid UUID", async () => {
    const res = await call(GET, { url: "/api/me", guest: "not-a-uuid" });

    expect(res.status).toBe(401);
    expect(res.json.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 when the cookie points at a non-guest user", async () => {
    const nonGuestId = newGuest();
    await db.insert(users).values({ id: nonGuestId, isGuest: false });

    const res = await call(GET, { url: "/api/me", guest: nonGuestId });

    expect(res.status).toBe(401);
    expect(res.json.error.code).toBe("UNAUTHORIZED");
  });

  it("handles two concurrent first calls for the same new guest without a 500", async () => {
    // A real browser fires several requests at once on first load (e.g.
    // GuestBanner's /api/me alongside the page's own data fetch). Both used
    // to be able to see "no existing row" and both try to insert it.
    const guest = newGuest();

    const [first, second] = await Promise.all([
      call(GET, { url: "/api/me", guest }),
      call(GET, { url: "/api/me", guest }),
    ]);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.json.data).toEqual(second.json.data);
  });
});
