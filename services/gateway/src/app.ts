import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
const app = express();

app.listen(process.env.PORT, () => {
  console.log("gateway service running on - http://localhost:8080");
});

app.use(cors({ origin: process.env.CLIENT, credentials: true }));
app.use(morgan("dev"));

app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://localhost:4002/auth",
    changeOrigin: true,
  }),
);

// Fallback route (must be last)
// app.use("/", (req: Request, res: Response) => {
//   res.json({ message: "Gateway Server" });
// });
