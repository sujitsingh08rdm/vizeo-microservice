import mongoose, { Schema, model } from "mongoose";
import { VideoModelInterface } from "./video.interface";
import { VideoStatusEnum } from "./video.enum";

const schema = new Schema<VideoModelInterface>(
  {
    user: { type: mongoose.Schema.ObjectId },
    title: { type: String, required: true },
    description: { type: String },
    size: { type: Number, required: true },
    duration: { type: Number, required: true },
    path: { type: String, required: true },
    shares: { type: Number, default: 0, required: true },
    status: {
      type: String,
      enum: VideoStatusEnum,
      default: VideoStatusEnum.draft,
    },
    thumbnail: {
      high: { path: String, width: Number, height: Number },
      medium: { path: String, width: Number, height: Number },
      low: { path: String, width: Number, height: Number },
    },
  },
  { timestamps: true },
);

const VideoModel = model<VideoModelInterface>("Video", schema);
export default VideoModel;
