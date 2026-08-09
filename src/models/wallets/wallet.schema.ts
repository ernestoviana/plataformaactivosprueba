import { z } from "zod";

export const createWalletSchema = z.object({
  user_id: z.uuid(),
  type: z.enum(["USDT", "XAUT"]),
  current_balance: z.string(),
});

export type CreateWalletInput = z.infer<typeof createWalletSchema>;

export const walletSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  type: z.enum(["USDT", "XAUT"]),
  current_balance: z.number(),
  withheld_balance: z.number(),
  total_balance: z.number(),
});
