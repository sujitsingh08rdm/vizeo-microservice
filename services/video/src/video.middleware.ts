import { NextFunction, Request, Response } from "express";
import { z, ZodType } from "zod";
import axios from "axios";
import crypto from "crypto";
import { AuthRequestInterface } from "./video.interface";
axios.defaults.baseURL = process.env.SERVER;

export const DtoMiddleware =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        error: z.treeifyError(result.error),
      });
    }
    req.body = result.data;
    next();
  };

export const authMiddleware = async (
  req: AuthRequestInterface,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new Error("Unauthorized");
    }

    const options = { headers: { "x-api-key": process.env.API_KEY } };
    const { data } = await axios.post("/auth/verify-token", { token }, options);

    req.user = {
      id: data.id,
      mobile: data.mobile,
      email: data.email,
      fullname: data.fullname,
    };
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
    }
  }
};

export const webhookGuardMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lambdaSignature = req.headers["x-api-signature"];
    const payload = JSON.stringify(req.body);

    const signature = crypto
      .createHmac("sha256", process.env.WEBHOOK_SECRET!)
      .update(payload)
      .digest("hex");

    if (signature !== lambdaSignature) {
      throw new Error("Signature not matched");
    }
    next();
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
    res.status(401).json({ message: "unauthorized" });
  }
};
