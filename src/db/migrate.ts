import { FileMigrationProvider, Migrator } from "kysely/migration";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

import { db } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, "migrations"),
  }),
});

const { error, results } = await migrator.migrateToLatest();

results?.forEach((result) => {
  console.log(`${result.migrationName}: ${result.status}`);
});

if (error) {
  console.error("Migration failed");
  console.error(error);
  process.exit(1);
}

await db.destroy();
