import { Worker } from 'bullmq';
import { chunk } from 'lodash';
import { container } from 'tsyringe';
import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import { logger } from '../lib/logger';
import { BaseWorker } from './BaseWorker';
import { clearRepeatableJobs, queues, workerRedisClient } from '../lib/bullmq';
import { prisma } from '../lib/prisma';
import { ShopifyService } from '../services/ShopifyService';

export class ShopifyShopSyncWorker extends BaseWorker {
  protected logger = logger.child({
    ref: 'workers:ShopifyShopSyncWorker',
  });

  protected bullmqWorker: Worker | null = null;

  public async start() {
    this.logger.info('Starting...');

    await clearRepeatableJobs('ShopifyShopSync');

    await queues.ShopifyShopSync.add('ShopifyShopSync', null, {
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
      queues.ShopifyShopSync.name,
      async () => {
        try {
          const shops = await prisma.shop.findMany({
            where: {
              uninstalledAt: null,
            },
          });
          const shopifyService = container.resolve(ShopifyService);
          const chunks = chunk(shops, 5);

          // eslint-disable-next-line no-restricted-syntax
          for (const shopsChunk of chunks) {
            const promises = shopsChunk.map(async (shop) => {
              const data = await shopifyService.getShop({
                shopDomain: shop.domain,
                accessToken: shop.accessToken,
              });

              await prisma.shop.update({
                where: {
                  id: shop.id,
                },
                data: {
                  name: data.shop.name,
                  ownerName: data.shop.shop_owner,
                  shopifyRawData: data.shop as Prisma.JsonObject,
                },
              });
            });

            // eslint-disable-next-line no-await-in-loop
            await Promise.all(promises);
          }

          this.logger.info(`Synced ${shops.length} shops`);
        } catch (err) {
          // Log the error
          Sentry.captureException(err);

          // Rethrow the error to fail the job
          throw err;
        }
      },
      { connection: workerRedisClient, concurrency: 1 },
    );

    this.logger.info('Started');
  }
}
