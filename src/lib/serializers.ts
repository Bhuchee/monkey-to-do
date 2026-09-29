import type { tasks, users } from "@/db/schema";

type UserRow = typeof users.$inferSelect;
type TaskRow = typeof tasks.$inferSelect;

export function serializeMe(user: UserRow) {
  return {
    id: user.id,
    isGuest: user.isGuest,
    name: user.name,
    email: user.email,
    image: user.image,
  };
}

export function serializeTask(task: TaskRow) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    categoryId: null,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
