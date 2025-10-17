import { Queue } from 'bullmq';

export const scanQueue = new Queue('scanQueue', {
  connection: {
    url: process.env.REDIS_URL
  },
  defaultJobOptions: {
    // Jobs will be retried 3 times if they fail
    attempts: 3,
    // Exponential backoff strategy for retries (1s, 2s, 4s, 8s, ...)
    backoff: { 
      type: 'exponential',
      delay: 1000,
    },
  },
});