import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../lib/env.js";

type AuthTokenPayload = JwtPayload & {
  sub?: string;
  role?: string;
};

function isRole(value: string | undefined): value is "ADMIN" | "CLIENT" {
  return value === "ADMIN" || value === "CLIENT";
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, env.AUTH_SECRET) as AuthTokenPayload;

    if (typeof payload.sub !== "string" || !isRole(payload.role)) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    return next();
  } catch {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
}
