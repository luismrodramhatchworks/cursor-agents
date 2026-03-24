import { z } from "zod";

export const todoCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Keep the title brief"),
  completed: z.boolean().optional().default(false),
});

export const todoUpdateSchema = todoCreateSchema
  .partial()
  .refine(
    (value) => Object.values(value).some((v) => v !== undefined),
    "No fields provided to update",
  );

export const idSchema = z.number().int().positive();

export type TodoCreateInput = z.infer<typeof todoCreateSchema>;
export type TodoUpdateInput = z.infer<typeof todoUpdateSchema>;
