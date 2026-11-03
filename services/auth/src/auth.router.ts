import { Router } from "express";
import { login, signup } from "./auth.controller";
import { DtoMiddleware } from "./auth.middleware";
import { loginDtoSchema, signupDtoSchema } from "./auth.dto";
const AuthRouter = Router();

AuthRouter.post("/signup", DtoMiddleware(signupDtoSchema), signup);
AuthRouter.post("/login", DtoMiddleware(loginDtoSchema), login);

export default AuthRouter;
