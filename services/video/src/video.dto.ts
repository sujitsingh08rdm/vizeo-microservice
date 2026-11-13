import { z } from "zod";

export const createVideoDtoSchema = z
  .object({
    user: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    size: z.number().gte(0),
    duration: z.number().gte(0),
    path: z.string().optional(),
  })
  .strict();

export type CreateVideoDto = z.infer<typeof createVideoDtoSchema>;
