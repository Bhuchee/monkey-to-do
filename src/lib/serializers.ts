import type { users } from "@/db/schema";

type UserRow = typeof users.$inferSelect;

export function serializeMe(user: UserRow) {
  return {
    id: user.id,
    isGuest: user.isGuest,
    name: user.name,
    email: user.email,
    image: user.image,
  };
}
