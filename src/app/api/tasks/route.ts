import { createTask, listTasks } from "@/db/queries/tasks";
import { created, handle, ok, readJson } from "@/lib/http";
import { serializeTask } from "@/lib/serializers";
import { requireUser } from "@/lib/session";
import { taskCreateSchema, taskListQuerySchema } from "@/lib/validation/tasks";

export const GET = handle(async (request: Request) => {
  const user = await requireUser(request);
  const searchParams = new URL(request.url).searchParams;
  const query = taskListQuerySchema.parse(Object.fromEntries(searchParams));
  const rows = await listTasks(user.id, query);
  return ok(rows.map(serializeTask));
});

export const POST = handle(async (request: Request) => {
  const user = await requireUser(request);
  const input = taskCreateSchema.parse(await readJson(request));
  const row = await createTask(user.id, input);
  return created(serializeTask(row));
});
