import { z } from "zod";

export const createLedgerSchema = z.object({
  wallet_id: z.string(),
});

export type CreateLedgerInput = z.infer<typeof createLedgerSchema>;

export const ledgerSchema = z.object({
  id: z.string(),
  wallet_id: z.string(),
  created_date: z.string(),
});

export type LedgerData = z.infer<typeof ledgerSchema>;
