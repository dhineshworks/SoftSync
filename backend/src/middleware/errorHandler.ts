import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.issues[0]?.message ?? "Validation error" });
  }
  if (err instanceof Error && err.message.includes("E11000")) {
    return res.status(409).json({ error: "Duplicate entry" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
