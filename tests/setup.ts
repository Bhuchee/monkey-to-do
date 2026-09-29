import { sql } from "drizzle-orm";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, beforeAll } from "vitest";

import { db } from "@/db";
import type * as schema from "@/db/schema";

// Extend this list as new tables are added (tasks in M3, notes in M6, ...).
const TABLES = ["users"];

beforeAll(async () => {
  await migrate(db as unknown as PgliteDatabase<typeof schema>, {
    migrationsFolder: "./src/db/migrations",
  });
});

afterEach(async () => {
  await db.execute(
    sql.raw(`TRUNCATE TABLE ${TABLES.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE`),
  );
});
