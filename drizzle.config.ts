import { defineConfig } from "drizzle-kit";

// `generate` only diffs schema.ts and needs no live connection, so DATABASE_URL
// is optional here. `migrate` does need a real connection — if DATABASE_URL is
// unset when that runs, drizzle-kit reports the missing/invalid connection itself.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
