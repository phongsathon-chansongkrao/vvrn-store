import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";
import multer from "multer";

/** Throw this from a route to send a specific status and message. */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Express 4 doesn't catch rejected promises, so wrap async handlers. */
export const ah =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, "Not found."));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err instanceof ZodError) return res.status(400).json({ error: err.issues[0]?.message || "Invalid request." });
  if (err instanceof multer.MulterError) {
    const msg = err.code === "LIMIT_FILE_SIZE" ? "That file is over 10 MB. Upload a smaller one." : "Upload failed. Try again.";
    return res.status(400).json({ error: msg });
  }
  if (err instanceof SyntaxError && "body" in (err as object)) return res.status(400).json({ error: "Invalid JSON." });
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our side. Try again in a moment." });
}
