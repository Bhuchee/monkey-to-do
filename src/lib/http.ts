import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, { status: 200, ...init });
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function fail(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
) {
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status },
  );
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    const text = await request.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch {
    throw new ZodError([
      {
        code: "custom",
        path: [],
        message: "Malformed JSON body",
      },
    ]);
  }
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return uuidPattern.test(value);
}

export function parseId(id: string): string {
  if (!isUuid(id)) {
    throw new NotFoundError();
  }
  return id;
}

export function handle<C>(
  fn: (request: Request, context: C) => Promise<NextResponse>,
): (request: Request, context: C) => Promise<NextResponse> {
  return async (request: Request, context: C) => {
    try {
      return await fn(request, context);
    } catch (error) {
      if (error instanceof ZodError) {
        return fail(400, "VALIDATION_ERROR", "Validation failed", {
          fieldErrors: error.flatten().fieldErrors,
        });
      }
      if (error instanceof NotFoundError) {
        return fail(404, "NOT_FOUND", error.message || "Not found");
      }
      if (error instanceof UnauthorizedError) {
        return fail(401, "UNAUTHORIZED", error.message || "Unauthorized");
      }
      console.error(error);
      return fail(500, "INTERNAL_ERROR", "Something went wrong");
    }
  };
}
