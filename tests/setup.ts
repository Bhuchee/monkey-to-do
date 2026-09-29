import { afterEach, beforeAll } from "vitest";

beforeAll(async () => {
  // Schema is empty until a milestone adds tables; migrations are applied
  // here once tests exercise the database.
});

afterEach(async () => {
  // Tables are truncated between tests once tests exercise the database.
});
