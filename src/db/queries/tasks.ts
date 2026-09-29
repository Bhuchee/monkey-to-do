import { and, desc, eq, gte, ilike, isNull, lt, lte, ne, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { tasks } from "@/db/schema";
import { serverTodayUTC } from "@/lib/dates";
import { NotFoundError } from "@/lib/http";
import type { TaskCreateInput, TaskListQuery, TaskUpdateInput } from "@/lib/validation/tasks";

type TaskStatus = "todo" | "in_progress" | "done";

function completedAtForStatus(status: TaskStatus): Date | null {
  return status === "done" ? new Date() : null;
}

function addDaysToDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export async function listTasks(userId: string, query: TaskListQuery) {
  const conditions: SQL[] = [eq(tasks.userId, userId)];

  if (query.q) {
    const pattern = `%${query.q}%`;
    const searchCondition = or(ilike(tasks.title, pattern), ilike(tasks.description, pattern));
    if (searchCondition) conditions.push(searchCondition);
  }

  if (query.status) {
    conditions.push(eq(tasks.status, query.status));
  }

  if (query.priority) {
    conditions.push(eq(tasks.priority, query.priority));
  }

  if (query.due) {
    const today = query.today ?? serverTodayUTC();
    if (query.due === "overdue") {
      conditions.push(lt(tasks.dueDate, today));
      conditions.push(ne(tasks.status, "done"));
    } else if (query.due === "today") {
      conditions.push(eq(tasks.dueDate, today));
    } else if (query.due === "week") {
      conditions.push(gte(tasks.dueDate, today));
      conditions.push(lte(tasks.dueDate, addDaysToDateString(today, 6)));
    } else if (query.due === "none") {
      conditions.push(isNull(tasks.dueDate));
    }
  }

  if (query.dueFrom) {
    conditions.push(gte(tasks.dueDate, query.dueFrom));
  }
  if (query.dueTo) {
    conditions.push(lte(tasks.dueDate, query.dueTo));
  }

  return db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(
      sql`case when ${tasks.status} = 'done' then 1 else 0 end`,
      sql`${tasks.dueDate} asc nulls last`,
      sql`case ${tasks.priority} when 'high' then 0 when 'medium' then 1 else 2 end`,
      desc(tasks.createdAt),
    )
    .limit(500);
}

export async function getTask(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .limit(1);

  if (!row) throw new NotFoundError();
  return row;
}

export async function createTask(userId: string, input: TaskCreateInput) {
  const [row] = await db
    .insert(tasks)
    .values({
      userId,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate ?? null,
      completedAt: completedAtForStatus(input.status),
    })
    .returning();

  return row;
}

export async function updateTask(userId: string, id: string, input: TaskUpdateInput) {
  const updateValues: Partial<typeof tasks.$inferInsert> = { updatedAt: new Date() };

  if (input.title !== undefined) updateValues.title = input.title;
  if (input.description !== undefined) updateValues.description = input.description;
  if (input.priority !== undefined) updateValues.priority = input.priority;
  if (input.dueDate !== undefined) updateValues.dueDate = input.dueDate;
  if (input.status !== undefined) {
    updateValues.status = input.status;
    updateValues.completedAt = completedAtForStatus(input.status);
  }

  const [row] = await db
    .update(tasks)
    .set(updateValues)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning();

  if (!row) throw new NotFoundError();
  return row;
}

export async function deleteTask(userId: string, id: string) {
  const [row] = await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning({ id: tasks.id });

  if (!row) throw new NotFoundError();
}
