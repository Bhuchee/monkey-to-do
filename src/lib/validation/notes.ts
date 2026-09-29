import { z } from "zod";

const titleSchema = z.string().trim().max(200, "Title must be 200 characters or fewer");
const contentSchema = z.string().trim().max(20000, "Content must be 20,000 characters or fewer");

export const noteCreateSchema = z
  .object({
    title: titleSchema.optional().default(""),
    content: contentSchema.optional().default(""),
  })
  .strict();

export const noteUpdateSchema = z
  .object({
    title: titleSchema.optional(),
    content: contentSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, { message: "Nothing to update" });

export const noteListQuerySchema = z
  .object({
    q: z.string().trim().max(100).optional(),
  })
  .strict();

export type NoteCreateInput = z.infer<typeof noteCreateSchema>;
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;
export type NoteListQuery = z.infer<typeof noteListQuerySchema>;
