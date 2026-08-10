import { randomUUID } from "node:crypto";

import { db } from "../../db/db.js";
import type { CreateQuoteInput, UpdateQuoteInput } from "./quote.schema.js";

export async function createQuote(input: CreateQuoteInput) {
  return db
    .insertInto("quotes")
    .values({
      id: randomUUID(),
      user_id: input.user_id,
      status: "ACTIVE",
      creation_date: input.creation_date,
      expiry_date: input.expiry_date,
      wallet_source_id: input.wallet_source_id,
      wallet_destination_id: input.wallet_destination_id,
      source_value: input.source_value,
      destination_value: input.destination_value,
      fee: input.fee,
    })
    .returningAll()
    .executeTakeFirst();
}

export async function getQuoteByIdDB(id: string) {
  const quote = await db
    .selectFrom("quotes")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
  return quote;
}

export async function getQuotesByUserId(userId: string) {
  const quotes = await db
    .selectFrom("quotes")
    .selectAll()
    .where("user_id", "=", userId)
    .execute();
  return quotes;
}

export async function updateQuote(id: string, input: UpdateQuoteInput) {
  return db
    .updateTable("quotes")
    .set(input)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirst();
}

export async function removeAllQuotes() {
  return db.deleteFrom("quotes").execute();
}
