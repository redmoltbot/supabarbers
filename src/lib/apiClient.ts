const BASE = "https://api.digitalwallet.cards/api/v2";

export async function dwFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.API_KEY!,
      ...options.headers,
    },
  });
}
