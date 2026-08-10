import { z } from "zod";

export const createQuoteSchema = z.object({
  user_id: z.uuid(),
  wallet_source_id: z.uuid(),
  wallet_destination_id: z.uuid(),
  source_value: z.string(),
  destination_value: z.string(),
  creation_date: z.string(),
  expiry_date: z.string(),
  fee: z.string(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;

export const updateQuoteSchema = z.object({
  status: z.enum(["ACTIVE", "EXPIRED", "USED"]),
});

export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;

export const calculateQuoteSchema = z.object({
  amount_to_transfer: z.string(),
  asset_quote_type: z.enum(["USDT_XAUT", "XAUT_USDT"]),
});

export type CalculateQuoteInput = z.infer<typeof calculateQuoteSchema>;
