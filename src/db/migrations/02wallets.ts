import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("wallets")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("users.id").onDelete("cascade")
    )
    .addColumn("type", "varchar(10)", (col) => col.notNull())
    .addColumn("current_balance", "numeric(18, 2)", (col) =>
      col.notNull().defaultTo(0)
    )
    .addColumn("withheld_balance", "numeric(18, 2)", (col) =>
      col.notNull().defaultTo(0)
    )
    .addColumn("total_balance", "numeric(18, 2)", (col) =>
      col.notNull().defaultTo(0)
    )
    .addUniqueConstraint("wallets_user_id_type_unique", ["user_id", "type"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("wallets").execute();
}
