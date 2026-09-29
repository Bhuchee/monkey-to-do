import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ data: { status: "ok", db: "ok" } }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { data: { status: "degraded", db: "error" } },
      { status: 503 },
    );
  }
}
