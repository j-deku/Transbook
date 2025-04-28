// utils/pushQueue.js
import Queue from 'bull';
import { sendPushNotification } from './sendPushNotification.js';

export const pushQueue = new Queue('pushQueue', { redis: { url: process.env.REDIS_URL } });

// Process up to N jobs concurrently, configurable via environment
pushQueue.process(parseInt(process.env.PUSH_CONCURRENCY || '5', 10), async job => {
  return sendPushNotification(job.data);
});

export function queuePushNotification(jobData) {
  return pushQueue.add(jobData, {
    attempts:  5,
    backoff:   { type: 'exponential', delay: 10000 },
    removeOnComplete: true,
    removeOnFail:     false,
  });
}
