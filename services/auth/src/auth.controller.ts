import jwt, { JwtPayload } from "jsonwebtoken";
import { CookieOptions, Request, Response } from "express";
import * as authService from "./auth.service";

export interface SessionInterface extends Request {
  session?: authService.SessionPayloadInterface;
}

const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

const accessCookieOptions: CookieOptions = {
  ...authCookieOptions,
  maxAge: Number(process.env.ACCESS_TOKEN_EXPIRY_MS),
};

const refreshCookieOptions: CookieOptions = {
  ...authCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const signup = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const auth = await authService.signup(body);
    res.json(auth);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const auth = await authService.login(body);
    res.cookie("accessToken", auth.accessToken, accessCookieOptions);
    res.cookie("refreshToken", auth.refreshToken, refreshCookieOptions);
    res.json(auth);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getSession = async (req: Request, res: Response) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({ message: "Unauthenticated" });
    }
    const { iat, exp, ...user } = jwt.verify(
      accessToken,
      process.env.AUTH_SECRET!,
    ) as JwtPayload;
    res.json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ message: "Invalid or expired access token" });
    }
  }
};

export const refreshToken = async (req: SessionInterface, res: Response) => {
  try {
    console.log("IN refresh controller");

    if (!req.session) {
      return res.status(401).json({ message: "Unable to Refresh TOken" });
    }
    const auth = await authService.refreshToken(req.session);
    res.cookie("accessToken", auth.accessToken, accessCookieOptions);
    res.cookie("refreshToken", auth.refreshToken, refreshCookieOptions);
    res.json(auth);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
    }
  }
};

export const logout = async (_req: Request, res: Response) => {
  try {
    res.clearCookie("accessToken", authCookieOptions);
    res.clearCookie("refreshToken", authCookieOptions);
    res.json({ message: "Logout success" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const auth = authService.verifyToken(req.body);
    if (!auth) {
      throw new Error("Token Verification failed");
    }
    res.json(auth);
  } catch (error) {
    if (error instanceof Error)
      res.status(500).json({ message: error.message });
  }
};
