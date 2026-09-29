import { beforeEach, describe, expect, it } from "vitest";

import { DELETE, GET as GET_ONE, PATCH } from "@/app/api/tasks/[id]/route";
import { GET as GET_LIST, POST } from "@/app/api/tasks/route";
import { call, makeTask, newGuest } from "../helpers";

describe("GET /api/tasks", () => {
  let guestA: string;
  let guestB: string;

  beforeEach(() => {
    guestA = newGuest();
    guestB = newGuest();
  });

  it("returns an empty list when the user has no tasks", async () => {
    const res = await call(GET_LIST, { url: "/api/tasks", guest: guestA });

    expect(res.status).toBe(200);
    expect(res.json.data).toEqual([]);
  });

  it("returns only the current user's tasks", async () => {
    const mine = await makeTask(guestA, { title: "Mine" });
    await makeTask(guestB, { title: "Theirs" });

    const res = await call(GET_LIST, { url: "/api/tasks", guest: guestA });

    expect(res.status).toBe(200);
    expect(res.json.data).toHaveLength(1);
    expect(res.json.data[0].id).toBe(mine.id);
  });

  it("filters by q on title or description, case-insensitively", async () => {
    const byTitle = await makeTask(guestA, { title: "Quarterly report" });
    const byDescription = await makeTask(guestA, {
      title: "Walk dog",
      description: "Buy groceries for the quarter",
    });
    await makeTask(guestA, { title: "Unrelated" });

    const res = await call(GET_LIST, { url: "/api/tasks?q=QUARTER", guest: guestA });

    expect(res.status).toBe(200);
    const ids = res.json.data.map((t: { id: string }) => t.id);
    expect(ids.sort()).toEqual([byTitle.id, byDescription.id].sort());
  });

  it("filters by status", async () => {
    const todo = await makeTask(guestA, { status: "todo" });
    await makeTask(guestA, { status: "done" });

    const res = await call(GET_LIST, { url: "/api/tasks?status=todo", guest: guestA });

    expect(res.json.data).toHaveLength(1);
    expect(res.json.data[0].id).toBe(todo.id);
  });

  it("filters by priority", async () => {
    const high = await makeTask(guestA, { priority: "high" });
    await makeTask(guestA, { priority: "low" });

    const res = await call(GET_LIST, { url: "/api/tasks?priority=high", guest: guestA });

    expect(res.json.data).toHaveLength(1);
    expect(res.json.data[0].id).toBe(high.id);
  });

  describe("due filter (fixed today=2027-06-15)", () => {
    it("due=overdue matches past due, not-done tasks only", async () => {
      const overdue = await makeTask(guestA, { dueDate: "2027-06-10", status: "todo" });
      await makeTask(guestA, { dueDate: "2027-06-10", status: "done" });
      await makeTask(guestA, { dueDate: "2027-06-20", status: "todo" });

      const res = await call(GET_LIST, {
        url: "/api/tasks?due=overdue&today=2027-06-15",
        guest: guestA,
      });

      expect(res.json.data).toHaveLength(1);
      expect(res.json.data[0].id).toBe(overdue.id);
    });

    it("due=today matches only tasks due exactly today", async () => {
      const dueToday = await makeTask(guestA, { dueDate: "2027-06-15" });
      await makeTask(guestA, { dueDate: "2027-06-16" });

      const res = await call(GET_LIST, {
        url: "/api/tasks?due=today&today=2027-06-15",
        guest: guestA,
      });

      expect(res.json.data).toHaveLength(1);
      expect(res.json.data[0].id).toBe(dueToday.id);
    });

    it("due=week matches today through today+6 days inclusive", async () => {
      const inWeek = await makeTask(guestA, { dueDate: "2027-06-20" });
      await makeTask(guestA, { dueDate: "2027-06-25" });
      await makeTask(guestA, { dueDate: "2027-06-14" });

      const res = await call(GET_LIST, {
        url: "/api/tasks?due=week&today=2027-06-15",
        guest: guestA,
      });

      expect(res.json.data).toHaveLength(1);
      expect(res.json.data[0].id).toBe(inWeek.id);
    });

    it("due=none matches tasks with no due date", async () => {
      const noDate = await makeTask(guestA, { dueDate: null });
      await makeTask(guestA, { dueDate: "2027-06-15" });

      const res = await call(GET_LIST, {
        url: "/api/tasks?due=none&today=2027-06-15",
        guest: guestA,
      });

      expect(res.json.data).toHaveLength(1);
      expect(res.json.data[0].id).toBe(noDate.id);
    });
  });

  it("combines filters with AND", async () => {
    const match = await makeTask(guestA, { status: "todo", priority: "high" });
    await makeTask(guestA, { status: "todo", priority: "low" });
    await makeTask(guestA, { status: "done", priority: "high" });

    const res = await call(GET_LIST, {
      url: "/api/tasks?status=todo&priority=high",
      guest: guestA,
    });

    expect(res.json.data).toHaveLength(1);
    expect(res.json.data[0].id).toBe(match.id);
  });

  it("applies the default sort: not-done before done, due date asc (nulls last)", async () => {
    const done = await makeTask(guestA, { title: "A", status: "done", dueDate: null });
    const dueLater = await makeTask(guestA, { title: "B", status: "todo", dueDate: "2027-06-20" });
    const dueSooner = await makeTask(guestA, { title: "C", status: "todo", dueDate: "2027-06-10" });
    const noDue = await makeTask(guestA, { title: "D", status: "in_progress", dueDate: null });

    const res = await call(GET_LIST, { url: "/api/tasks", guest: guestA });

    const ids = res.json.data.map((t: { id: string }) => t.id);
    expect(ids).toEqual([dueSooner.id, dueLater.id, noDue.id, done.id]);
  });

  it("sorts by priority (high, medium, low) then created_at desc when due dates tie", async () => {
    const low = await makeTask(guestA, {
      title: "X",
      priority: "low",
      createdAt: new Date("2027-01-01T00:00:00Z"),
    });
    const highOlder = await makeTask(guestA, {
      title: "Y",
      priority: "high",
      createdAt: new Date("2027-01-02T00:00:00Z"),
    });
    const highNewer = await makeTask(guestA, {
      title: "Z",
      priority: "high",
      createdAt: new Date("2027-01-03T00:00:00Z"),
    });

    const res = await call(GET_LIST, { url: "/api/tasks", guest: guestA });

    const ids = res.json.data.map((t: { id: string }) => t.id);
    expect(ids).toEqual([highNewer.id, highOlder.id, low.id]);
  });

  it("returns 400 for an invalid filter value", async () => {
    const res = await call(GET_LIST, { url: "/api/tasks?status=bogus", guest: guestA });

    expect(res.status).toBe(400);
    expect(res.json.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/tasks", () => {
  it("returns 401 without a guest cookie", async () => {
    const res = await call(POST, { url: "/api/tasks", body: { title: "Buy milk" } });

    expect(res.status).toBe(401);
  });

  it("creates a task with defaults", async () => {
    const guest = newGuest();

    const res = await call(POST, { url: "/api/tasks", guest, body: { title: "Buy milk" } });

    expect(res.status).toBe(201);
    expect(res.json.data).toMatchObject({
      title: "Buy milk",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: null,
      categoryId: null,
      completedAt: null,
    });
  });

  it("creates a task with all fields", async () => {
    const guest = newGuest();

    const res = await call(POST, {
      url: "/api/tasks",
      guest,
      body: {
        title: "Ship it",
        description: "Final review",
        status: "in_progress",
        priority: "high",
        dueDate: "2027-06-15",
      },
    });

    expect(res.status).toBe(201);
    expect(res.json.data).toMatchObject({
      title: "Ship it",
      description: "Final review",
      status: "in_progress",
      priority: "high",
      dueDate: "2027-06-15",
    });
  });

  it("returns 400 for a missing title", async () => {
    const res = await call(POST, { url: "/api/tasks", guest: newGuest(), body: {} });
    expect(res.status).toBe(400);
  });

  it("returns 400 for a blank title", async () => {
    const res = await call(POST, { url: "/api/tasks", guest: newGuest(), body: { title: "   " } });
    expect(res.status).toBe(400);
  });

  it("returns 400 for a title over 200 characters", async () => {
    const res = await call(POST, {
      url: "/api/tasks",
      guest: newGuest(),
      body: { title: "a".repeat(201) },
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid enum value", async () => {
    const res = await call(POST, {
      url: "/api/tasks",
      guest: newGuest(),
      body: { title: "Task", status: "bogus" },
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid calendar date", async () => {
    const res = await call(POST, {
      url: "/api/tasks",
      guest: newGuest(),
      body: { title: "Task", dueDate: "2026-02-30" },
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for an unknown field", async () => {
    const res = await call(POST, {
      url: "/api/tasks",
      guest: newGuest(),
      body: { title: "Task", nope: true },
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/tasks/:id", () => {
  it("returns the task when it belongs to the current user", async () => {
    const guest = newGuest();
    const task = await makeTask(guest);

    const res = await call(GET_ONE, { url: `/api/tasks/${task.id}`, guest, params: { id: task.id } });

    expect(res.status).toBe(200);
    expect(res.json.data.id).toBe(task.id);
  });

  it("returns 404 for another user's task", async () => {
    const owner = newGuest();
    const other = newGuest();
    const task = await makeTask(owner);

    const res = await call(GET_ONE, { url: `/api/tasks/${task.id}`, guest: other, params: { id: task.id } });

    expect(res.status).toBe(404);
  });

  it("returns 404 for an invalid UUID", async () => {
    const res = await call(GET_ONE, {
      url: "/api/tasks/not-a-uuid",
      guest: newGuest(),
      params: { id: "not-a-uuid" },
    });

    expect(res.status).toBe(404);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await call(GET_ONE, {
      url: "/api/tasks/00000000-0000-0000-0000-000000000000",
      guest: newGuest(),
      params: { id: "00000000-0000-0000-0000-000000000000" },
    });

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/tasks/:id", () => {
  it("applies a partial update", async () => {
    const guest = newGuest();
    const task = await makeTask(guest, { title: "Old" });

    const res = await call(PATCH, {
      method: "PATCH",
      url: `/api/tasks/${task.id}`,
      guest,
      params: { id: task.id },
      body: { title: "New" },
    });

    expect(res.status).toBe(200);
    expect(res.json.data.title).toBe("New");
  });

  it("returns 400 for an empty body", async () => {
    const guest = newGuest();
    const task = await makeTask(guest);

    const res = await call(PATCH, {
      method: "PATCH",
      url: `/api/tasks/${task.id}`,
      guest,
      params: { id: task.id },
      body: {},
    });

    expect(res.status).toBe(400);
  });

  it("sets completedAt when status becomes done", async () => {
    const guest = newGuest();
    const task = await makeTask(guest, { status: "todo" });

    const res = await call(PATCH, {
      method: "PATCH",
      url: `/api/tasks/${task.id}`,
      guest,
      params: { id: task.id },
      body: { status: "done" },
    });

    expect(res.status).toBe(200);
    expect(res.json.data.status).toBe("done");
    expect(res.json.data.completedAt).not.toBeNull();
  });

  it("clears completedAt when status leaves done", async () => {
    const guest = newGuest();
    const task = await makeTask(guest, { status: "done", completedAt: new Date() });

    const res = await call(PATCH, {
      method: "PATCH",
      url: `/api/tasks/${task.id}`,
      guest,
      params: { id: task.id },
      body: { status: "todo" },
    });

    expect(res.status).toBe(200);
    expect(res.json.data.status).toBe("todo");
    expect(res.json.data.completedAt).toBeNull();
  });

  it("updates updatedAt", async () => {
    const guest = newGuest();
    const task = await makeTask(guest, { updatedAt: new Date("2020-01-01T00:00:00Z") });

    const res = await call(PATCH, {
      method: "PATCH",
      url: `/api/tasks/${task.id}`,
      guest,
      params: { id: task.id },
      body: { title: "Changed" },
    });

    expect(res.status).toBe(200);
    expect(new Date(res.json.data.updatedAt).getTime()).toBeGreaterThan(
      new Date("2020-01-01T00:00:00Z").getTime(),
    );
  });

  it("returns 404 for another user's task", async () => {
    const owner = newGuest();
    const other = newGuest();
    const task = await makeTask(owner);

    const res = await call(PATCH, {
      method: "PATCH",
      url: `/api/tasks/${task.id}`,
      guest: other,
      params: { id: task.id },
      body: { title: "Hijacked" },
    });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("deletes the task and returns 204", async () => {
    const guest = newGuest();
    const task = await makeTask(guest);

    const res = await call(DELETE, {
      method: "DELETE",
      url: `/api/tasks/${task.id}`,
      guest,
      params: { id: task.id },
    });

    expect(res.status).toBe(204);

    const getRes = await call(GET_ONE, { url: `/api/tasks/${task.id}`, guest, params: { id: task.id } });
    expect(getRes.status).toBe(404);
  });

  it("returns 404 for another user's task", async () => {
    const owner = newGuest();
    const other = newGuest();
    const task = await makeTask(owner);

    const res = await call(DELETE, {
      method: "DELETE",
      url: `/api/tasks/${task.id}`,
      guest: other,
      params: { id: task.id },
    });

    expect(res.status).toBe(404);
  });
});
