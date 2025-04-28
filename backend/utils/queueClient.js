// queueClient.js
import IORedis from 'ioredis';
import { Queue, Worker, QueueScheduler } from 'bullmq';

// Reuse one Redis connection across components when possible
const connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });

// Define the queue
export const pushQueue = new Queue('pushQueue', { connection });

// Scheduler to handle stalled/delayed jobs
new QueueScheduler('pushQueue', { connection });

// Worker to process jobs
export const pushWorker = new Worker('pushQueue', async job => {
  // job.data has { fcmToken, payload }
  await sendPushNotification(job.data);
}, { connection });
