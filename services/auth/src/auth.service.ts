import bcrypt from "bcrypt";
import { loginDto, signupDto } from "./auth.dto";
import AuthModel from "./auth.model";
import { AuthModelInterface } from "./auth.interface";
import jwt from "jsonwebtoken";

const generateAccessToken = (user: AuthModelInterface) => {
  const payload = {
    id: user._id,
    mobile: user.mobile,
    fullname: user.fullname,
    email: user.email,
  };

  const expiresIn = parseInt(process.env.ACCESS_TOKEN_EXPIRY!);
  const secret = process.env.AUTH_SECRET!;
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};

export const signup = async (body: signupDto) => {
  const data = await AuthModel.create(body);
  return { message: "Signup successfull" };
};

export const login = async (body: loginDto) => {
  const { email, password } = body;
  if (!email || !password) {
    throw new Error("Email and Password is required");
  }
  const user = await AuthModel.findOne({ email });
  if (!user) {
    throw new Error("Invalid Credentials");
  }
  const isPasswordValid = await bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid Credentials");
  }
  const accessToken = generateAccessToken(user);
  // create refresh token

  return {
    message: "Login Successfull",
    accessToken,
    refreshToken: user.refreshToken,
  };
};
