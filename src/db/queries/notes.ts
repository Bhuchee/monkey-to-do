import { and, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { notes } from "@/db/schema";
import { NotFoundError } from "@/lib/http";
import type { NoteCreateInput, NoteListQuery, NoteUpdateInput } from "@/lib/validation/notes";

export async function listNotes(userId: string, query: NoteListQuery) {
  const conditions = [eq(notes.userId, userId)];

  if (query.q) {
    const pattern = `%${query.q}%`;
    const searchCondition = or(ilike(notes.title, pattern), ilike(notes.content, pattern));
    if (searchCondition) conditions.push(searchCondition);
  }

  return db
    .select()
    .from(notes)
    .where(and(...conditions))
    .orderBy(desc(notes.updatedAt))
    .limit(500);
}

export async function getNote(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .limit(1);

  if (!row) throw new NotFoundError();
  return row;
}

export async function createNote(userId: string, input: NoteCreateInput) {
  const [row] = await db
    .insert(notes)
    .values({ userId, title: input.title, content: input.content })
    .returning();

  return row;
}

export async function updateNote(userId: string, id: string, input: NoteUpdateInput) {
  const updateValues: Partial<typeof notes.$inferInsert> = { updatedAt: new Date() };

  if (input.title !== undefined) updateValues.title = input.title;
  if (input.content !== undefined) updateValues.content = input.content;

  const [row] = await db
    .update(notes)
    .set(updateValues)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();

  if (!row) throw new NotFoundError();
  return row;
}

export async function deleteNote(userId: string, id: string) {
  const [row] = await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning({ id: notes.id });

  if (!row) throw new NotFoundError();
}
