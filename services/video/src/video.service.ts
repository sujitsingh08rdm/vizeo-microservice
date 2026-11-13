import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CreateVideoDto } from "./video.dto";
import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import VideoModel from "./video.model";
import fs from "fs";

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

  body.user = userId;
  body.path = path;
  const video = await VideoModel.create(body);

  const uploadUrl = await generateSignedUrlForUpload(
    path,
    userId,
    video._id.toString(),
  );
  return { uploadUrl, video };
};

export const fetchVideos = async () => {
  const videos = await VideoModel.find();
  return { videos };
};

export const fetchVideoById = () => {
  return "fetch one";
};

export const updateMetadata = () => {
  return "update";
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
  fs.writeFileSync("test.json", JSON.stringify(body, null, 2));
  const videoId = body.userMetadata.video_id;
  const status = getVideoStatus(body.status);
  await VideoModel.updateOne({ _id: videoId }, { status });
  return "video status updated";
};
