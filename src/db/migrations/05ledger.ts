import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("ledger")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("wallet_id", "uuid", (col) =>
      col.notNull().references("wallets.id").onDelete("cascade")
    )
    .addColumn("created_date", "timestamp", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("ledger").execute();
}
