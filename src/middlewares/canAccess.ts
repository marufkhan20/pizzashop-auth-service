import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import type { AuthRequest } from "../types/index.ts";

export const canAccess =
  (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    const roleFromToken = authReq.auth.role;

    if (!roles.includes(roleFromToken)) {
      const error = createHttpError(403, "You don't have enough permissions");
      return next(error);
    }

    next();
  };
