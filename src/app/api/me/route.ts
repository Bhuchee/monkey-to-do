import { handle, ok } from "@/lib/http";
import { serializeMe } from "@/lib/serializers";
import { requireUser } from "@/lib/session";

export const GET = handle(async (request: Request) => {
  const user = await requireUser(request);
  return ok(serializeMe(user));
});
