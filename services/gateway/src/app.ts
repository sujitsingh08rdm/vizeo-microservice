import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import { createProxyMiddleware } from "http-proxy-middleware";
import { CORS_CONFIG } from "./gateway.constant";
import Redis from "ioredis";
import { channel } from "diagnostics_channel";

const subscriber = new Redis();

const app = express();

const server = createServer(app);

server.listen(process.env.PORT, () => {
  console.log("gateway service running on - http://localhost:8080");
});

app.use(cors(CORS_CONFIG));
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

app.use(
  "/video",
  createProxyMiddleware({
    target: "http://localhost:4003/video",
    changeOrigin: true,
  }),
);

const io = new Server(server, { cors: CORS_CONFIG });

io.on("connection", () => {
  console.log("USER CONNECTED");
});

subscriber.subscribe("video-converting", (err) => {
  if (err) {
    console.log("Failed to subscribe video-converting channel");
    return;
  }
  console.log("Video transcoding channel subscribed!");
});

subscriber.on("message", (channel, message) => {
  console.log(channel, "- pub sub channel name");
  io.emit("video-converting", message);
});
