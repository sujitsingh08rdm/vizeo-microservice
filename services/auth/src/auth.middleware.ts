import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import AuthModel from "./auth.model";
import moment from "moment";
import { SessionInterface } from "./auth.controller";

export const DtoMiddleware =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Auth Validation failed",
        error: result.error.format(),
      });
      return;
    }
    req.body = result.data;
    next();
  };

export const RefreshMiddleware = async (
  req: SessionInterface,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("IN refresh middleware");
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res
        .status(401)
        .json({ message: "failed to refresh token no fresh token" });
      return;
    }
    const user = await AuthModel.findOne({ refreshToken });

    if (!user) {
      res
        .status(401)
        .json({ message: "failed to refresh token no fresh token" });
      return;
    }

    const today = moment();
    const expiry = moment(user.expiredAt);

    const isExpired = today.isAfter(expiry);
    if (isExpired) {
      res
        .status(401)
        .json({ message: "failed to refresh token no fresh token" });
      return;
    }

    req.session = {
      id: user._id as any,
      mobile: user.mobile,
      fullname: user.fullname,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};
