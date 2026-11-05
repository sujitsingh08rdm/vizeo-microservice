import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
mongoose
  .connect(process.env.DB!)
  .then(() => console.log("auth - DB Running"))
  .catch(() => console.log("auth - DB Failed"));

import express from "express";
import AuthRouter from "./auth.router";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.listen(process.env.PORT, () => {
  console.log("auth service running on - http://localhost:4002/auth");
});

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT, credentials: true }));

app.use("/auth", AuthRouter);
