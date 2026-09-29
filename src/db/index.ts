import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";

import * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

const isDevPglite = process.env.NODE_ENV === "development" && !process.env.DATABASE_URL;

function createDb(): Db {
  if (process.env.NODE_ENV === "test") {
    const client = new PGlite();
    return drizzlePglite(client, { schema }) as unknown as Db;
  }

  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    return drizzleNeon(sql, { schema });
  }

  if (process.env.NODE_ENV === "development") {
    const client = new PGlite("./.pglite");
    return drizzlePglite(client, { schema }) as unknown as Db;
  }

  throw new Error("DATABASE_URL is not set — see .env.example");
}

let instance: Db | undefined;

function getDb(): Db {
  if (!instance) {
    instance = createDb();
  }
  return instance;
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
});

// Called once from instrumentation.ts, before the dev server accepts any
// requests, so the persisted local PGlite database is never queried ahead of
// its own migrations. No-op for tests (setup.ts handles that DB) and for
// production/any DATABASE_URL-configured environment (migrations there run
// via `drizzle-kit migrate` in `vercel-build`, not at request time).
export async function ensureDevDbMigrated(): Promise<void> {
  if (!isDevPglite) return;
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate(getDb() as unknown as PgliteDatabase<typeof schema>, {
    migrationsFolder: "./src/db/migrations",
  });
}
