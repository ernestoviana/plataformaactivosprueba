import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("exchanges")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("quote_id", "uuid", (col) =>
      col.notNull().references("quotes.id").onDelete("cascade")
    )
    .addColumn("idempotency_key", "varchar(50)", (col) =>
      col.notNull().unique()
    )
    .addColumn("requires_followup", "boolean", (col) => col.notNull())
    .addColumn("status", "varchar(50)", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("exchanges").execute();
}
