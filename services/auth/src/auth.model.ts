import moment from "moment";
import { Schema, model } from "mongoose";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import { AuthModelInterface } from "./auth.interface";

const schema = new Schema<AuthModelInterface>(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String },
    expiredAt: { type: Date },
  },
  { timestamps: true },
);

schema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  // Chnage this since its needed during signup(or user creations) will mark this as below as null for both
  this.refreshToken = uuid();
  this.expiredAt = moment().add(1, "M").toDate();
});

const AuthModel = model<AuthModelInterface>("Auth", schema);
export default AuthModel;
