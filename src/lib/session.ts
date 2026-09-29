import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { isUuid, UnauthorizedError } from "@/lib/http";

const GUEST_COOKIE = "mtd_guest";

export type CurrentUser = typeof users.$inferSelect;

function readGuestCookie(request: Request): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;

  for (const part of header.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) continue;
    const name = part.slice(0, separatorIndex).trim();
    if (name === GUEST_COOKIE) {
      return decodeURIComponent(part.slice(separatorIndex + 1).trim());
    }
  }

  return undefined;
}

export async function requireUser(request: Request): Promise<CurrentUser> {
  const guestId = readGuestCookie(request);

  if (!guestId || !isUuid(guestId)) {
    throw new UnauthorizedError();
  }

  const [existing] = await db.select().from(users).where(eq(users.id, guestId)).limit(1);

  if (existing) {
    if (!existing.isGuest) {
      throw new UnauthorizedError();
    }
    return existing;
  }

  const [created] = await db
    .insert(users)
    .values({ id: guestId, isGuest: true })
    .returning();

  return created;
}
