export type Me = {
  id: string;
  isGuest: boolean;
  name: string | null;
  email: string | null;
  image: string | null;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error?.message ?? "Request failed");
  }
  return json.data as T;
}

export async function getMe(): Promise<Me> {
  const response = await fetch("/api/me");
  return parseResponse<Me>(response);
}
