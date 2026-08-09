import { randomUUID } from "node:crypto";

import { db } from "../../db/db.js";
import { CreateLedgerInput } from "./ledger.schema.js";

export async function createLedger(input: CreateLedgerInput) {
  return db.insertInto("ledger").values({
    id: randomUUID(),
    wallet_id: input.wallet_id,
    created_date: new Date().toISOString(),
  });
}

export async function getLedgerByWalletId(walledId: string) {
  return db
    .selectFrom("ledger")
    .selectAll()
    .where("wallet_id", "=", walledId)
    .executeTakeFirst();
}
