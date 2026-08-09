import { z } from "zod";

export const createUserSchema = z.object({
  outside_id: z.string().min(1),
  role: z.enum(["admin", "compliance", "user"]).nonoptional(),
  status: z.enum(["active", "inactive"]).nonoptional(),
});

export const userSchema = z.object({
  id: z.string().min(1),
  outside_id: z.string().min(1),
  role: z.enum(["admin", "compliance", "user"]).nonoptional(),
  status: z.enum(["active", "inactive"]).nonoptional(),
});

export const updateUserSchema = z.object({
  role: z.enum(["admin", "compliance", "user"]).nonoptional(),
  status: z.enum(["active", "inactive"]).nonoptional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
