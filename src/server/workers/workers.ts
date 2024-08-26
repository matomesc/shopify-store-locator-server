import * as Sentry from '@sentry/nextjs';
import { BaseWorker } from './BaseWorker';
import { logger as baseLogger } from '../lib/logger';
import '../../../sentry.server.config';
import { ShopifyShopSyncWorker } from './ShopifyShopSyncWorker';
import { SessionPruneWorker } from './SessionPruneWorker';

const workers: BaseWorker[] = [];

const logger = baseLogger.child({
  ref: 'workers:main',
});

function setupSignalHandlers() {
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}, stopping workers...`);

    await Promise.all(
      workers.map(async (worker) => {
        await worker.stop();
      }),
    );

    logger.info('Stopped workers');

    process.exit(0);
  };

  process.on('SIGINT', () => {
    gracefulShutdown('SIGINT').catch((err) => Sentry.captureException(err));
  });

  process.on('SIGTERM', () => {
    gracefulShutdown('SIGTERM').catch((err) => Sentry.captureException(err));
  });
}

async function main() {
  setupSignalHandlers();

  const classes = [ShopifyShopSyncWorker, SessionPruneWorker];

  logger.info('Starting workers...');

  // eslint-disable-next-line no-restricted-syntax
  for (const Klass of classes) {
    const worker = new Klass();

    // eslint-disable-next-line no-await-in-loop
    await worker.start();

    workers.push(worker);
  }

  logger.info('Started workers');
}

main().catch((err) => {
  Sentry.captureException(err);
});
