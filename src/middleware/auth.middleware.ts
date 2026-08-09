import type { NextFunction, Request, Response } from "express";
import { getUserById } from "../models/users/user.repository.js";

export async function authenticationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.header("X-User-Id");
  if (!userId) {
    return res.status(401).json({ message: "Missing User Id Header" });
  }
  const user = await getUserById(userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  } else if (user.status !== "active") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = user;

  next();
}

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (allowedRoles.includes(user.role)) {
      next();
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }
  };
}
