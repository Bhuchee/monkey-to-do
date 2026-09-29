import { z } from "zod";

import { dateStringSchema } from "./common";

const titleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(200, "Title must be 200 characters or fewer");

const descriptionSchema = z
  .string()
  .trim()
  .max(5000, "Description must be 5,000 characters or fewer");

const statusSchema = z.enum(["todo", "in_progress", "done"]);
const prioritySchema = z.enum(["low", "medium", "high"]);

export const taskCreateSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema.optional().default(""),
    status: statusSchema.optional().default("todo"),
    priority: prioritySchema.optional().default("medium"),
    dueDate: dateStringSchema.nullable().optional(),
  })
  .strict();

export const taskUpdateSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    status: statusSchema.optional(),
    priority: prioritySchema.optional(),
    dueDate: dateStringSchema.nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, { message: "Nothing to update" });

const dueFilterSchema = z.enum(["overdue", "today", "week", "none"]);

export const taskListQuerySchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    status: statusSchema.optional(),
    priority: prioritySchema.optional(),
    due: dueFilterSchema.optional(),
    today: dateStringSchema.optional(),
    dueFrom: dateStringSchema.optional(),
    dueTo: dateStringSchema.optional(),
  })
  .strict();

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;
