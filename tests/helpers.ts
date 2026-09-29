type CallOptions = {
  url: string;
  method?: string;
  guest?: string;
  body?: unknown;
  params?: Record<string, string>;
  headers?: Record<string, string>;
};

type RouteHandler = (
  request: Request,
  context: { params: Promise<Record<string, string>> },
) => Promise<Response>;

export async function call(handler: RouteHandler, options: CallOptions) {
  const { url, method, guest, body, params, headers } = options;
  const resolvedMethod = method ?? (body !== undefined ? "POST" : "GET");

  const requestHeaders: Record<string, string> = { ...(headers ?? {}) };
  let requestBody: string | undefined;
  if (body !== undefined) {
    requestHeaders["content-type"] = "application/json";
    requestBody = JSON.stringify(body);
  }
  if (guest) {
    requestHeaders["cookie"] = `mtd_guest=${guest}`;
  }

  const request = new Request(new URL(url, "http://localhost"), {
    method: resolvedMethod,
    headers: requestHeaders,
    body: requestBody,
  });

  const response = await handler(request, {
    params: Promise.resolve(params ?? {}),
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  return { status: response.status, json };
}

export function newGuest(): string {
  return crypto.randomUUID();
}
