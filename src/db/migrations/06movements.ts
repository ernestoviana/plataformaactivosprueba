import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("movements")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("ledger_id", "uuid", (col) =>
      col.notNull().references("ledger.id").onDelete("cascade")
    )
    .addColumn("wallet_id", "uuid", (col) =>
      col.notNull().references("wallets.id").onDelete("cascade")
    )
    .addColumn("exchange_id", "uuid", (col) =>
      col.notNull().references("exchanges.id").onDelete("cascade")
    )
    .addColumn("type", "varchar(50)", (col) => col.notNull())
    .addColumn("amount", "numeric(18, 2)", (col) => col.notNull())
    .addColumn("current_balance", "numeric(18, 2)", (col) => col.notNull())
    .addColumn("new_balance", "numeric(18, 2)", (col) => col.notNull())
    .addColumn("sequence", "integer", (col) => col.notNull())
    .addColumn("previous_hash", "varchar(255)")
    .addColumn("hash", "varchar(255)", (col) => col.notNull())
    .addColumn("execution_date", "timestamptz", (col) => col.notNull())
    .addUniqueConstraint("movements_ledger_id_unique", [
      "ledger_id",
      "sequence",
    ])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("movements").execute();
}
