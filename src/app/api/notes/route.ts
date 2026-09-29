import { createNote, listNotes } from "@/db/queries/notes";
import { created, handle, ok, readJson } from "@/lib/http";
import { serializeNote } from "@/lib/serializers";
import { requireUser } from "@/lib/session";
import { noteCreateSchema, noteListQuerySchema } from "@/lib/validation/notes";

export const GET = handle(async (request: Request) => {
  const user = await requireUser(request);
  const searchParams = new URL(request.url).searchParams;
  const query = noteListQuerySchema.parse(Object.fromEntries(searchParams));
  const rows = await listNotes(user.id, query);
  return ok(rows.map(serializeNote));
});

export const POST = handle(async (request: Request) => {
  const user = await requireUser(request);
  const input = noteCreateSchema.parse(await readJson(request));
  const row = await createNote(user.id, input);
  return created(serializeNote(row));
});
