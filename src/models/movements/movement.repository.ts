import { randomUUID } from "node:crypto";

import { db } from "../../db/db.js";

export async function getMovementsByLedgerId(ledgerId: string) {
  const movements = await db
    .selectFrom("movements")
    .selectAll()
    .where("ledger_id", "=", ledgerId)
    .execute();
  return movements;
}
