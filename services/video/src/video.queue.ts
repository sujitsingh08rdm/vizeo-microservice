import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis({ maxRetriesPerRequest: null });
export const webhookQueue = new Queue("webhook-queue", { connection });
