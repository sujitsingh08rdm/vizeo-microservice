import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSignedUrl as cloudfrontSigner } from "@aws-sdk/cloudfront-signer";
import { CreateVideoDto } from "./video.dto";
import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import VideoModel from "./video.model";
import { webhookQueue } from "./video.queue";
import path from "path";
import fs from "fs";
import moment from "moment";

const HALF_HOUR = 1800;

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

const generateSignedUrlForUpload = async (
  path: string,
  userId: string,
  videoId: string,
  acl: ObjectCannedACL = "private",
) => {
  const cmd = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: path,
    Metadata: {
      user_id: userId,
      video_id: videoId,
    },
    ACL: acl,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn: HALF_HOUR });
  return url;
};

export const createVideo = async (userId: string, body: CreateVideoDto) => {
  const filename = nanoid(8)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");

  const path = `originals/${userId}/${filename}.mp4`;
  const streamPath = `streams/${userId}/${filename}/${filename}.m3u8`;

  body.user = userId;
  body.path = path;
  body.streamPath = streamPath;
  const video = await VideoModel.create(body);

  const uploadUrl = await generateSignedUrlForUpload(
    path,
    userId,
    video._id.toString(),
  );
  return { uploadUrl, video };
};

export const fetchVideos = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit;
  const videos = await VideoModel.find({ user: userId })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  return { videos };
};

export const fetchVideoById = () => {
  return "fetch one";
};

export const updateMetadata = () => {
  return "update";
};

export const updatePlayCount = async (videoId: string) => {
  const video = await VideoModel.findByIdAndUpdate(
    videoId,
    { $inc: { plays: 1 } },
    { new: true },
  );
  return video;
};

export const deleteVideo = () => {
  return "delete";
};

const getVideoStatus = (status: string) => {
  if (status === "PROGRESSING") {
    return "converting";
  }
  if (status === "CANCELED" || status === "ERROR") {
    return "failed";
  }
  if (status === "COMPLETE") {
    return "published";
  }
};

export const videoConvertingWebhook = async (body: any) => {
  const videoId = body.userMetadata.video_id;
  const status = getVideoStatus(body.status);

  const options = {
    removeOnComplete: true,
    removeOnFailed: false,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  };

  await webhookQueue.add("update-status", { videoId, status }, options);
  return "video status job added to queue";
};

export const updateVideoStatus = async (videoId: string, status: string) => {
  await VideoModel.updateOne({ _id: videoId }, { status });
  return "Video Status updated";
};

export const generateCloudfrontSignedUrl = (streamPath: string) => {
  const root = process.cwd();
  const privateFilePath = path.join(root, "private.pem");
  const key = fs.readFileSync(privateFilePath, "utf-8");
  const url = cloudfrontSigner({
    url: `${process.env.CDN}/${streamPath}`,
    keyPairId: process.env.CDN_ID!,
    dateLessThan: moment().add(60, "minutes").toISOString(),
    privateKey: key,
  });
  return url;
};

export const getVideoStreamingUrl = (body: any) => {
  const url = generateCloudfrontSignedUrl(body.path);
  return { url };
};

export const createThumbnail = async (userId: string, body: any) => {
  const filename = nanoid(8)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");

  const path = `thumbnails/${userId}/${filename}.png`;

  body.user = userId;
  body.path = path;

  const uploadUrl = await generateSignedUrlForUpload(
    path,
    userId,
    body.videoId,
  );
  const payload = {
    thumbnail: {
      high: { path, width: 720, height: 1280 },
    },
  };

  await VideoModel.findByIdAndUpdate(body.videoId, payload);
  return { uploadUrl };
};

export const thumbnailWebhook = async (body: any) => {
  console.log("WEBHOOK THUMBMAIL REACHED");
  const videoId = body.video_id;
  const sizes = body.sizes;
  console.log(videoId, sizes);
  const payload = {
    thumbnail: sizes,
  };
  await VideoModel.findByIdAndUpdate(videoId, payload);
  return { message: "Thumbnail Updated" };
};
