import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodTypeAny } from "zod";

export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          fieldErrors: error.flatten().fieldErrors,
        });
      }

      return next(error);
    }
  };
}
