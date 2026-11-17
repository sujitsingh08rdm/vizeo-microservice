import { Job, Worker } from "bullmq";
import Redis from "ioredis";
import { updateVideoStatus } from "./video.service";

const connection = new Redis({ maxRetriesPerRequest: null });
const publisher = new Redis();

const processWebhookQueue = async (job: Job) => {
  console.log("Job REcieved, ", job.id, job.data);
  console.log(job.id, job.data);

  try {
    const updated = await updateVideoStatus(job.data.videoId, job.data.status);
    publisher.publish("video-converting", JSON.stringify(updated));
    return updated;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to process webhook job");
  }
};

const webhookWorker = new Worker("webhook-queue", processWebhookQueue, {
  connection,
});

webhookWorker.on("ready", async () => {
  console.log("Worker connected to Redis and ready");
});

webhookWorker.on("active", (job) => {
  console.log("JOB ACTIVE:", job.id);
});

webhookWorker.on("completed", (job, result) => {
  console.log("JOB COMPLETED:", job.id, result);
});

webhookWorker.on("failed", (job, err) => {
  console.error("JOB FAILED:", job?.id, err);
});

webhookWorker.on("error", (err) => {
  console.error("WORKER ERROR:", err);
});

webhookWorker.on("closing", () => {
  console.log("Worker is closing");
});
