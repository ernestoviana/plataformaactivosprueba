import { z } from "zod";

export const createExchangeSchema = z.object({
  quote_id: z.uuid(),
  idempotency_key: z.string().optional(),
});

export type CreateExchangeInput = z.infer<typeof createExchangeSchema>;

export const updateExchangeSchema = z.object({
  requires_followup: z.boolean(),
  status: z.enum([
    "CREATED",
    "PENDING_REVIEW",
    "PROCESSING",
    "COMPLETED",
    "REJECTED",
    "FAILED",
  ]),
});

export type UpdateExchangeInput = z.infer<typeof updateExchangeSchema>;
