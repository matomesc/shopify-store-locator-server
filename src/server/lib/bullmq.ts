import Redis from 'ioredis';
import { Queue } from 'bullmq';
import { config } from '../config';

/**
 * Setup two Redis connections according to
 * https://docs.bullmq.io/guide/going-to-production#automatic-reconnections.
 */

/**
 * The redis client used by BullMQ queues.
 */
export const queueRedisClient = new Redis(config.REDIS_URL, {
  enableOfflineQueue: false,
});

/**
 * The redis client used by BullMQ workers.
 */
export const workerRedisClient = new Redis(config.REDIS_URL, {
  enableOfflineQueue: true,
  maxRetriesPerRequest: null,
});

export const queues = {
  ShopifyShopSync: new Queue('ShopifyShopSync', {
    connection: queueRedisClient,
  }),
};

export async function clearRepeatableJobs(queueName: keyof typeof queues) {
  const queue = queues[queueName];
  const repeteableJobs = await queue.getRepeatableJobs();

  const removePromises = repeteableJobs.map((job) => {
    return queue.removeRepeatableByKey(job.key);
  });

  await Promise.all(removePromises);
}
