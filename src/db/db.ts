import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Database } from "./types.ts";

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: `postgresql://${process.env.DB_USER}:${
      process.env.DB_PASSWORD
    }@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${
      process.env.DB_NAME
    }`,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
