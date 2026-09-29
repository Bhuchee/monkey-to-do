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

  // Insert first (atomic at the DB level) rather than select-then-insert:
  // a browser's first page load fires several requests concurrently (e.g.
  // GuestBanner's /api/me alongside the page's own data fetch), and a
  // select-then-insert race let two requests both see "no existing row"
  // and both try to insert, so the loser hit a unique-constraint 500.
  const [created] = await db
    .insert(users)
    .values({ id: guestId, isGuest: true })
    .onConflictDoNothing()
    .returning();

  if (created) {
    return created;
  }

  const [existing] = await db.select().from(users).where(eq(users.id, guestId)).limit(1);

  if (!existing || !existing.isGuest) {
    throw new UnauthorizedError();
  }

  return existing;
}
