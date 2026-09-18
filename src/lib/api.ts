export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) { super(message); }
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    signal: options.signal ? AbortSignal.any([options.signal,AbortSignal.timeout(45_000)]) : AbortSignal.timeout(45_000),
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const body = await response
    .json()
    .catch(() => ({ error: "The server is unavailable. Please try again." }));
  if (!response.ok) throw new ApiError(body.error || "Request failed.", response.status, body.code);
  return body as T;
}
