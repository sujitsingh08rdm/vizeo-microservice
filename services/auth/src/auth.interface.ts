import { Document } from "mongoose";

export interface AuthModelInterface extends Document {
  email: string;
  fullname: string;
  mobile: string;
  password: string;
  refreshToken?: string;
  expiredAt?: Date;
}
