import { Worker } from 'bullmq';
import * as Sentry from '@sentry/nextjs';
import { chunk } from 'lodash';
import { DateTime } from 'luxon';
import { logger } from '../lib/logger';
import { BaseWorker } from './BaseWorker';
import { clearRepeatableJobs, queues, workerRedisClient } from '../lib/bullmq';
import { prisma } from '../lib/prisma';

export class SessionPruneWorker extends BaseWorker {
  protected logger = logger.child({
    ref: 'workers:SessionPruneWorker',
  });

  protected bullmqWorker: Worker | null = null;

  public async start() {
    this.logger.info('Starting...');

    await clearRepeatableJobs('SessionPrune');

    await queues.SessionPrune.add('SessionPrune', null, {
      repeat: {
        // pattern: '* * * * *',
        // Every hour at minute 0
        pattern: '0 * * * *',
      },
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 10000,
      },
      removeOnComplete: true,
      removeOnFail: true,
    });

    this.bullmqWorker = new Worker(
      queues.SessionPrune.name,
      async () => {
        try {
          const shops = await prisma.shop.findMany({
            include: {
              plan: true,
            },
          });
          const chunks = chunk(shops, 5);

          // eslint-disable-next-line no-restricted-syntax
          for (const shopsChunk of chunks) {
            const promises = shopsChunk.map(async (shop) => {
              const { analyticsRetention } = shop.plan;

              await prisma.session.deleteMany({
                where: {
                  shopId: shop.id,
                  createdAt: {
                    lt: DateTime.utc()
                      .minus({ days: analyticsRetention })
                      .toJSDate(),
                  },
                },
              });
            });

            // eslint-disable-next-line no-await-in-loop
            await Promise.all(promises);
          }

          this.logger.info(`Pruned sessions for ${shops.length} shops`);
        } catch (err) {
          // Log the error
          Sentry.captureException(err);

          // Rethrow the error to fail the job
          throw err;
        }
      },
      { connection: workerRedisClient, concurrency: 1 },
    );
  }
}
