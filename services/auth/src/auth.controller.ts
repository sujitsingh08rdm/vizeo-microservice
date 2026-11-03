import { Request, Response } from "express";
import * as authService from "./auth.service";

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
    res.cookie("accessToken", auth.accessToken, {
      httpOnly: true,
      maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRY!),
      domain: process.env.CLIENT_DOMAIN,
      secure: process.env.NODE_ENV === "dev" ? false : true,
    });

    res.cookie("refreshToken", auth.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      domain: process.env.CLIENT_DOMAIN,
      secure: process.env.NODE_ENV === "dev" ? false : true,
    });
    res.json(auth);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};
