import { randomUUID } from "node:crypto";

import { db } from "../../db/db.js";
import { CreateExchangeInput, UpdateExchangeInput } from "./exchange.schema.js";

export async function getExchange(id: string) {
  const exchange = await db
    .selectFrom("exchanges")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
  return exchange;
}

export async function getExchangeByIdempotencyKey(idempotencyKey: string) {
  const exchange = await db
    .selectFrom("exchanges")
    .selectAll()
    .where("idempotency_key", "=", idempotencyKey)
    .executeTakeFirst();
  return exchange;
}

export async function getPendingExchanges() {
  const exchanges = await db
    .selectFrom("exchanges")
    .selectAll()
    .where("status", "=", "PENDING_REVIEW")
    .execute();
  return exchanges;
}

export async function createExchange(input: CreateExchangeInput) {
  return db
    .insertInto("exchanges")
    .values({
      id: randomUUID(),
      quote_id: input.quote_id,
      idempotency_key: input.idempotency_key || randomUUID(),
      requires_followup: false,
      status: "CREATED",
    })
    .returningAll()
    .executeTakeFirst();
}

export async function updateExchange(id: string, input: UpdateExchangeInput) {
  return db
    .updateTable("exchanges")
    .set(input)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirst();
}
