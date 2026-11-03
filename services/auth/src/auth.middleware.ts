import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

export const DtoMiddleware =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    console.log(result);

    if (!result.success) {
      res.status(400).json({
        message: "Auth Validation failed",
        error: result.error.format(),
      });
    }
    req.body = result.data;
    next();
  };
