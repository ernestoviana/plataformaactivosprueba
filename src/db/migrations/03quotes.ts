import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("quotes")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade")
    )
    .addColumn("wallet_source_id", "uuid", (col) =>
      col.notNull().references("wallets.id").onDelete("cascade")
    )
    .addColumn("wallet_destination_id", "uuid", (col) =>
      col.notNull().references("wallets.id").onDelete("cascade")
    )
    .addColumn("status", "varchar(50)", (col) => col.notNull())
    .addColumn("creation_date", "timestamp", (col) => col.notNull())
    .addColumn("expiry_date", "timestamp", (col) => col.notNull())
    .addColumn("source_value", "numeric(18, 2)", (col) => col.notNull())
    .addColumn("destination_value", "numeric(18, 2)", (col) => col.notNull())
    .addColumn("fee", "numeric(18, 2)", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("quotes").execute();
}
