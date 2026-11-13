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

export const fetchVideos = async (req: Request, res: Response) => {
  const data = await videoService.fetchVideos();
  res.send(data);
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
  const data = await videoService.videoConvertingWebhook(req.body);
  res.send(data);
};
