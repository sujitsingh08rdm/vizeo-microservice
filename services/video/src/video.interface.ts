import { Document, Types } from "mongoose";
import { VideoStatusEnum } from "./video.enum";
import { Request } from "express";

interface VideoThumbnailInterface {
  high: { path: string; width: number; height: number };
  medium: { path: string; width: number; height: number };
  low: { path: string; width: number; height: number };
}

export interface VideoModelInterface extends Document {
  user: Types.ObjectId;
  title: string;
  description: string;
  size: number;
  duration: number;
  shares: number;
  path: string;
  status: VideoStatusEnum;
  thumbnail: VideoThumbnailInterface;
}
export interface AuthRequestInterface extends Request {
  user?: {
    id: string;
    mobile: string;
    email: string;
    fullname: string;
  };
}
