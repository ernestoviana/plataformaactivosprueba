import { z } from "zod";

export const createQuoteSchema = z.object({
  user_id: z.uuid(),
  wallet_source_id: z.uuid(),
  wallet_destination_id: z.uuid(),
  source_value: z.string(),
  destination_value: z.string(),
  fee: z.string(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;

export const updateQuoteSchema = z.object({
  status: z.enum(["ACTIVE", "EXPIRED", "USED"]),
});
