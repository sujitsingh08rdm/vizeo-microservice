import bcrypt from "bcrypt";
import { loginDto, signupDto } from "./auth.dto";
import AuthModel from "./auth.model";
import { AuthModelInterface } from "./auth.interface";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import moment from "moment";
import mongoose from "mongoose";

export interface SessionPayloadInterface {
  id: mongoose.Types.ObjectId;
  mobile: string;
  fullname: string;
  email: string;
}

const generateAccessToken = (user: SessionPayloadInterface) => {
  const payload = {
    id: user.id,
    mobile: user.mobile,
    fullname: user.fullname,
    email: user.email,
  };

  const expiresIn = parseInt(process.env.ACCESS_TOKEN_EXPIRY_MS!) / 1000;
  const secret = process.env.AUTH_SECRET!;
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};

const generateRefreshToken = () => {
  const refreshToken = uuid();
  return refreshToken;
};

export const signup = async (body: signupDto) => {
  await AuthModel.create(body);
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
  const accessToken = generateAccessToken({
    id: user._id as any, // map _id to id explicitly
    mobile: user.mobile,
    fullname: user.fullname,
    email: user.email,
  });
  const refreshToken = generateRefreshToken();

  await AuthModel.updateOne(
    { _id: user._id },
    { $set: { refreshToken, expiredAt: moment().add(7, "days").toDate() } },
  );

  return {
    message: "Login Successfull",
    accessToken,
    refreshToken,
  };
};

export const refreshToken = async (body: SessionPayloadInterface) => {
  const accessToken = generateAccessToken(body as any);
  const refreshToken = generateRefreshToken();

  await AuthModel.updateOne(
    { _id: body.id },
    { $set: { refreshToken, expiredAt: moment().add(7, "days").toDate() } },
  );

  return {
    message: "Refresh Token updated To DB",
    accessToken,
    refreshToken,
  };
};
