import { z } from "zod";

export const movementSchema = z.object({
  id: z.string(),
  exchange_id: z.string(),
  type: z.enum(["DEBIT", "CREDIT", "FEE"]),
  amount: z.string(),
  current_balance: z.string(),
  new_balance: z.string(),
  sequence: z.number(),
  execution_date: z.string(),
});

export type MovementSimplified = z.infer<typeof movementSchema>;

export const movementCreationSchema = z.object({
  id: z.uuid(),
  exchange_id: z.uuid(),
  wallet_id: z.uuid(),
  ledger_id: z.uuid(),
  type: z.enum(["DEBIT", "CREDIT", "FEE"]),
  amount: z.string(),
  current_balance: z.string(),
  new_balance: z.string(),
  sequence: z.number(),
  previous_hash: z.string().nullable(),
  hash: z.string(),
  execution_date: z.string(),
});

export type MovementCreationInput = z.infer<typeof movementCreationSchema>;
