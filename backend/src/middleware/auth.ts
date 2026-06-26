import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export type AuthRequest = Request & {
  user?: { id: string; email: string; role: "user" | "business" | "admin" };
};

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const payload = verifyToken(header.slice(7));
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function requireAdminOrBusiness(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "business")) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
}
