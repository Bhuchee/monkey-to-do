import { deleteTask, getTask, updateTask } from "@/db/queries/tasks";
import { handle, noContent, ok, parseId, readJson } from "@/lib/http";
import { serializeTask } from "@/lib/serializers";
import { requireUser } from "@/lib/session";
import { taskUpdateSchema } from "@/lib/validation/tasks";

type Context = { params: Promise<{ id: string }> };

export const GET = handle(async (request: Request, { params }: Context) => {
  const user = await requireUser(request);
  const id = parseId((await params).id);
  const row = await getTask(user.id, id);
  return ok(serializeTask(row));
});

export const PATCH = handle(async (request: Request, { params }: Context) => {
  const user = await requireUser(request);
  const id = parseId((await params).id);
  const input = taskUpdateSchema.parse(await readJson(request));
  const row = await updateTask(user.id, id, input);
  return ok(serializeTask(row));
});

export const DELETE = handle(async (request: Request, { params }: Context) => {
  const user = await requireUser(request);
  const id = parseId((await params).id);
  await deleteTask(user.id, id);
  return noContent();
});
