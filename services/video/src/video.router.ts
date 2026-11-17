import { Router } from "express";
import {
  createThumbnail,
  createVideo,
  deleteVideo,
  fetchVideoById,
  fetchVideos,
  getVideoStreamingUrl,
  thumbnailWebhook,
  updateMetadata,
  updatePlayCount,
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
VideoRouter.get("/", authMiddleware, fetchVideos);
VideoRouter.get("/:id", fetchVideoById);
VideoRouter.put("/:id", authMiddleware, updateMetadata);
VideoRouter.delete("/:id", authMiddleware, deleteVideo);
VideoRouter.post(
  "/webhook/converting",
  webhookGuardMiddleware,
  videoConvertingWebhook,
);
VideoRouter.post("/stream", authMiddleware, getVideoStreamingUrl);
VideoRouter.put("/:videoId/plays", authMiddleware, updatePlayCount);
VideoRouter.post("/thumbnail", authMiddleware, createThumbnail);
VideoRouter.post(
  "/webhook/thumbnail",
  webhookGuardMiddleware,
  thumbnailWebhook,
);

export default VideoRouter;
