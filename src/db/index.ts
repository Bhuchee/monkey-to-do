import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";

import * as schema from "./schema";

type Db = NeonHttpDatabase<typeof schema>;

function createDb(): Db {
  if (process.env.NODE_ENV === "test") {
    const client = new PGlite();
    return drizzlePglite(client, { schema }) as unknown as Db;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — see .env.example");
  }

  const sql = neon(process.env.DATABASE_URL);
  return drizzleNeon(sql, { schema });
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
