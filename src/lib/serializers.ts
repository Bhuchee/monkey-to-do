import type { notes, tasks, users } from "@/db/schema";

type UserRow = typeof users.$inferSelect;
type TaskRow = typeof tasks.$inferSelect;
type NoteRow = typeof notes.$inferSelect;

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

export function serializeNote(note: NoteRow) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}
