import { Request, Response, NextFunction } from "express";

// Authentication check middleware
export function requireAuthentication(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}