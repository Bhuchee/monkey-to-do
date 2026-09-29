import { deleteNote, getNote, updateNote } from "@/db/queries/notes";
import { handle, noContent, ok, parseId, readJson } from "@/lib/http";
import { serializeNote } from "@/lib/serializers";
import { requireUser } from "@/lib/session";
import { noteUpdateSchema } from "@/lib/validation/notes";

type Context = { params: Promise<{ id: string }> };

export const GET = handle(async (request: Request, { params }: Context) => {
  const user = await requireUser(request);
  const id = parseId((await params).id);
  const row = await getNote(user.id, id);
  return ok(serializeNote(row));
});

export const PATCH = handle(async (request: Request, { params }: Context) => {
  const user = await requireUser(request);
  const id = parseId((await params).id);
  const input = noteUpdateSchema.parse(await readJson(request));
  const row = await updateNote(user.id, id, input);
  return ok(serializeNote(row));
});

export const DELETE = handle(async (request: Request, { params }: Context) => {
  const user = await requireUser(request);
  const id = parseId((await params).id);
  await deleteNote(user.id, id);
  return noContent();
});
