import { Router } from "express";
import {
  createVideo,
  deleteVideo,
  fetchVideoById,
  fetchVideos,
  updateMetadata,
  videoConvertingWebhook,
} from "./video.controller";
import {
  authMiddleware,
  DtoMiddleware,
  webhookGuardMiddleware,
} from "./video.middleware";
import { createVideoDtoSchema } from "./video.dto";
const VideoRouter = Router();

VideoRouter.post(
  "/",
  authMiddleware,
  DtoMiddleware(createVideoDtoSchema),
  createVideo,
);
VideoRouter.get("/", fetchVideos);
VideoRouter.get("/:id", fetchVideoById);
VideoRouter.put("/:id", updateMetadata);
VideoRouter.delete("/:id", deleteVideo);
VideoRouter.post(
  "/webhook/converting",
  webhookGuardMiddleware,
  videoConvertingWebhook,
);

export default VideoRouter;
