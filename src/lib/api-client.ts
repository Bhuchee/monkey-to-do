import { localToday } from "@/lib/dates";

export type Me = {
  id: string;
  isGuest: boolean;
  name: string | null;
  email: string | null;
  image: string | null;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok) {
    throw new ApiError(response.status, json?.error?.message ?? "Request failed");
  }
  return json.data as T;
}

export async function getMe(): Promise<Me> {
  const response = await fetch("/api/me");
  return parseResponse<Me>(response);
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  categoryId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskCreateInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
};

export type TaskUpdateInput = Partial<TaskCreateInput>;

export async function listTasks(params?: Record<string, string>): Promise<Task[]> {
  // today is always computed fresh here (never persisted in the URL) so a
  // shared or refreshed link resolves "due" filters against the viewer's
  // current date, not whatever date the link was created on.
  const resolvedParams =
    params?.due && !params.today ? { ...params, today: localToday() } : params;
  const qs =
    resolvedParams && Object.keys(resolvedParams).length > 0
      ? `?${new URLSearchParams(resolvedParams)}`
      : "";
  const response = await fetch(`/api/tasks${qs}`);
  return parseResponse<Task[]>(response);
}

export async function createTask(input: TaskCreateInput): Promise<Task> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Task>(response);
}

export async function updateTask(id: string, input: TaskUpdateInput): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Task>(response);
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const json = await response.json().catch(() => null);
    throw new ApiError(response.status, json?.error?.message ?? "Request failed");
  }
}

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type NoteCreateInput = {
  title?: string;
  content?: string;
};

export type NoteUpdateInput = Partial<NoteCreateInput>;

export async function listNotes(params?: Record<string, string>): Promise<Note[]> {
  const qs = params && Object.keys(params).length > 0 ? `?${new URLSearchParams(params)}` : "";
  const response = await fetch(`/api/notes${qs}`);
  return parseResponse<Note[]>(response);
}

export async function createNote(input: NoteCreateInput = {}): Promise<Note> {
  const response = await fetch("/api/notes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Note>(response);
}

export async function updateNote(id: string, input: NoteUpdateInput): Promise<Note> {
  const response = await fetch(`/api/notes/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Note>(response);
}

export async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const json = await response.json().catch(() => null);
    throw new ApiError(response.status, json?.error?.message ?? "Request failed");
  }
}
