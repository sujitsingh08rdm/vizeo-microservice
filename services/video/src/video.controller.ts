import { Request, Response } from "express";
import * as videoService from "./video.service";
import { AuthRequestInterface } from "./video.interface";

export const createVideo = async (req: AuthRequestInterface, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const video = await videoService.createVideo(userId, req.body);
    res.send(video);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const fetchVideos = async (req: AuthRequestInterface, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(404).json({
        message: "unauthorized",
      });
    }
    const data = await videoService.fetchVideos(userId, page, limit);
    res.send(data);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const fetchVideoById = async (req: Request, res: Response) => {
  const data = await videoService.fetchVideoById();
  res.send(data);
};

export const updateMetadata = async (req: Request, res: Response) => {
  const data = await videoService.updateMetadata();
  res.send(data);
};

export const deleteVideo = async (req: Request, res: Response) => {
  const data = await videoService.deleteVideo();
  res.send(data);
};

export const videoConvertingWebhook = async (req: Request, res: Response) => {
  try {
    const data = await videoService.videoConvertingWebhook(req.body);
    res.send(data);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getVideoStreamingUrl = async (req: Request, res: Response) => {
  try {
    const stream = await videoService.getVideoStreamingUrl(req.body);
    res.json(stream);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const updatePlayCount = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    if (!videoId) {
      return res.status(404).json({
        message: "Video ID not Provided by Client",
      });
    }

    const video = await videoService.updatePlayCount(videoId as string);

    if (!video) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    return res.status(200).json({
      message: "Play count updated",
      plays: video.plays,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const createThumbnail = async (
  req: AuthRequestInterface,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const thumbnail = await videoService.createThumbnail(userId, req.body);
    res.send(thumbnail);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);

      res.status(500).json({ message: error.message });
    }
  }
};

export const thumbnailWebhook = async (req: Request, res: Response) => {
  try {
    const video = await videoService.thumbnailWebhook(req.body);
    res.json(video);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  }
};
