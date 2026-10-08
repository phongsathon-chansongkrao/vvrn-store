/** Base URL of the backend. In development Vite proxies /api to localhost:4000 (see vite.config.ts). */
export const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

interface Options {
  method?: string;
  body?: unknown; // sent as JSON
  form?: FormData; // sent as multipart (file uploads)
}

export async function api<T = any>(path: string, opts: Options = {}): Promise<T> {
  const hasBody = opts.body !== undefined || opts.form !== undefined;
  const init: RequestInit = {
    method: opts.method ?? (hasBody ? "POST" : "GET"),
    credentials: "include", // send the login cookie
  };
  if (opts.form) init.body = opts.form;
  else if (opts.body !== undefined) {
    init.body = JSON.stringify(opts.body);
    init.headers = { "Content-Type": "application/json" };
  }

  let res: Response;
  try {
    res = await fetch(BASE + path, init);
  } catch {
    throw new ApiError(0, "Can't reach the server. Check that the backend is running.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error || `Request failed (${res.status}).`);
  return data as T;
}
