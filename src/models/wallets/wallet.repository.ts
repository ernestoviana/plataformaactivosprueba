import { randomUUID } from "node:crypto";

import { db } from "../../db/db.js";
import type { CreateWalletInput } from "./wallet.schema.js";

export async function getWalletsByUserId(userId: string) {
  const wallets = await db
    .selectFrom("wallets")
    .selectAll()
    .where("user_id", "=", userId)
    .execute();
  return wallets;
}

export async function createWallet(input: CreateWalletInput) {
  return db
    .insertInto("wallets")
    .values({
      id: randomUUID(),
      user_id: input.user_id,
      type: input.type,
      current_balance: input.current_balance,
      total_balance: input.current_balance,
      withheld_balance: "0",
    })
    .returningAll()
    .executeTakeFirst();
}

export async function removeAllWallets() {
  return db.deleteFrom("wallets").execute();
}
