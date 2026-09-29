import { describe, expect, it } from "vitest";

import { DELETE, GET as GET_ONE, PATCH } from "@/app/api/notes/[id]/route";
import { GET as GET_LIST, POST } from "@/app/api/notes/route";
import { call, makeNote, newGuest } from "../helpers";

describe("GET /api/notes", () => {
  it("returns an empty list when the user has no notes", async () => {
    const res = await call(GET_LIST, { url: "/api/notes", guest: newGuest() });

    expect(res.status).toBe(200);
    expect(res.json.data).toEqual([]);
  });

  it("returns only the current user's notes", async () => {
    const guestA = newGuest();
    const guestB = newGuest();
    const mine = await makeNote(guestA, { title: "Mine" });
    await makeNote(guestB, { title: "Theirs" });

    const res = await call(GET_LIST, { url: "/api/notes", guest: guestA });

    expect(res.status).toBe(200);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data[0].id).toBe(mine.id);
  });

  it("filters by q on title or content, case-insensitively", async () => {
    const guest = newGuest();
    const byTitle = await makeNote(guest, { title: "Quarterly report", content: "" });
    const byContent = await makeNote(guest, { title: "Walk dog", content: "Buy groceries for the quarter" });
    await makeNote(guest, { title: "Unrelated", content: "" });

    const res = await call(GET_LIST, { url: "/api/notes?q=QUARTER", guest });

    expect(res.status).toBe(200);
    const ids = res.json.data.map((n: { id: string }) => n.id);
    expect(ids.sort()).toEqual([byTitle.id, byContent.id].sort());
  });

  it("sorts by updatedAt descending", async () => {
    const guest = newGuest();
    const older = await makeNote(guest, {
      title: "Older",
      updatedAt: new Date("2027-01-01T00:00:00Z"),
    });
    const newer = await makeNote(guest, {
      title: "Newer",
      updatedAt: new Date("2027-01-02T00:00:00Z"),
    });

    const res = await call(GET_LIST, { url: "/api/notes", guest });

    const ids = res.json.data.map((n: { id: string }) => n.id);
    expect(ids).toEqual([newer.id, older.id]);
  });
});

describe("POST /api/notes", () => {
  it("returns 401 without a guest cookie", async () => {
    const res = await call(POST, { url: "/api/notes", body: {} });
    expect(res.status).toBe(401);
  });

  it("creates a note with an empty body, defaulting title and content", async () => {
    const res = await call(POST, { url: "/api/notes", guest: newGuest(), body: {} });

    expect(res.status).toBe(201);
    expect(res.json.data).toMatchObject({ title: "", content: "" });
  });

  it("creates a note with fields", async () => {
    const res = await call(POST, {
      url: "/api/notes",
      guest: newGuest(),
      body: { title: "Standup notes", content: "Talked about the sprint." },
    });

    expect(res.status).toBe(201);
    expect(res.json.data).toMatchObject({
      title: "Standup notes",
      content: "Talked about the sprint.",
    });
  });

  it("returns 400 for a title over 200 characters", async () => {
    const res = await call(POST, {
      url: "/api/notes",
      guest: newGuest(),
      body: { title: "a".repeat(201) },
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for content over 20,000 characters", async () => {
    const res = await call(POST, {
      url: "/api/notes",
      guest: newGuest(),
      body: { content: "a".repeat(20001) },
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for an unknown field", async () => {
    const res = await call(POST, {
      url: "/api/notes",
      guest: newGuest(),
      body: { title: "Note", nope: true },
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/notes/:id", () => {
  it("returns the note when it belongs to the current user", async () => {
    const guest = newGuest();
    const note = await makeNote(guest);

    const res = await call(GET_ONE, { url: `/api/notes/${note.id}`, guest, params: { id: note.id } });

    expect(res.status).toBe(200);
    expect(res.json.data.id).toBe(note.id);
  });

  it("returns 404 for another user's note", async () => {
    const owner = newGuest();
    const other = newGuest();
    const note = await makeNote(owner);

    const res = await call(GET_ONE, {
      url: `/api/notes/${note.id}`,
      guest: other,
      params: { id: note.id },
    });

    expect(res.status).toBe(404);
  });

  it("returns 404 for an invalid UUID", async () => {
    const res = await call(GET_ONE, {
      url: "/api/notes/not-a-uuid",
      guest: newGuest(),
      params: { id: "not-a-uuid" },
    });

    expect(res.status).toBe(404);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await call(GET_ONE, {
      url: "/api/notes/00000000-0000-0000-0000-000000000000",
      guest: newGuest(),
      params: { id: "00000000-0000-0000-0000-000000000000" },
    });

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/notes/:id", () => {
  it("applies a partial update", async () => {
    const guest = newGuest();
    const note = await makeNote(guest, { title: "Old" });

    const res = await call(PATCH, {
      method: "PATCH",
      url: `/api/notes/${note.id}`,
      guest,
      params: { id: note.id },
      body: { title: "New" },
    });

    expect(res.status).toBe(200);
    expect(res.json.data.title).toBe("New");
  });

  it("returns 400 for an empty body", async () => {
    const guest = newGuest();
    const note = await makeNote(guest);

    const res = await call(PATCH, {
      method: "PATCH",
      url: `/api/notes/${note.id}`,
      guest,
      params: { id: note.id },
      body: {},
    });

    expect(res.status).toBe(400);
  });

  it("updates updatedAt", async () => {
    const guest = newGuest();
    const note = await makeNote(guest, { updatedAt: new Date("2020-01-01T00:00:00Z") });

    const res = await call(PATCH, {
      method: "PATCH",
      url: `/api/notes/${note.id}`,
      guest,
      params: { id: note.id },
      body: { content: "Changed" },
    });

    expect(res.status).toBe(200);
    expect(new Date(res.json.data.updatedAt).getTime()).toBeGreaterThan(
      new Date("2020-01-01T00:00:00Z").getTime(),
    );
  });

  it("returns 404 for another user's note", async () => {
    const owner = newGuest();
    const other = newGuest();
    const note = await makeNote(owner);

    const res = await call(PATCH, {
      method: "PATCH",
      url: `/api/notes/${note.id}`,
      guest: other,
      params: { id: note.id },
      body: { title: "Hijacked" },
    });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/notes/:id", () => {
  it("deletes the note and returns 204", async () => {
    const guest = newGuest();
    const note = await makeNote(guest);

    const res = await call(DELETE, {
      method: "DELETE",
      url: `/api/notes/${note.id}`,
      guest,
      params: { id: note.id },
    });

    expect(res.status).toBe(204);

    const getRes = await call(GET_ONE, { url: `/api/notes/${note.id}`, guest, params: { id: note.id } });
    expect(getRes.status).toBe(404);
  });

  it("returns 404 for another user's note", async () => {
    const owner = newGuest();
    const other = newGuest();
    const note = await makeNote(owner);

    const res = await call(DELETE, {
      method: "DELETE",
      url: `/api/notes/${note.id}`,
      guest: other,
      params: { id: note.id },
    });

    expect(res.status).toBe(404);
  });
});
