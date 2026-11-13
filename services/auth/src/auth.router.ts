import { Router } from "express";
import {
  getSession,
  login,
  logout,
  refreshToken,
  signup,
  verifyToken,
} from "./auth.controller";
import {
  DtoMiddleware,
  IscMiddleware,
  RefreshMiddleware,
} from "./auth.middleware";
import {
  loginDtoSchema,
  signupDtoSchema,
  verifyTokenDtoSchema,
} from "./auth.dto";
const AuthRouter = Router();

AuthRouter.post("/signup", DtoMiddleware(signupDtoSchema), signup);
AuthRouter.post("/login", DtoMiddleware(loginDtoSchema), login);
AuthRouter.get("/session", getSession);
AuthRouter.post("/refresh-token", RefreshMiddleware, refreshToken);
AuthRouter.post(
  "/verify-token",
  IscMiddleware,
  DtoMiddleware(verifyTokenDtoSchema),
  verifyToken,
);
AuthRouter.post("/logout", logout);

export default AuthRouter;
