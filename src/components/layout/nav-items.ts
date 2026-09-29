import { ListTodo, NotebookPen, SquareKanban } from "lucide-react";

export const navItems = [
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/board", label: "Board", icon: SquareKanban },
  { href: "/notes", label: "Notes", icon: NotebookPen },
] as const;
