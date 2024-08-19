import { Worker } from 'bullmq';
import { Logger } from 'pino';

export abstract class BaseWorker {
  protected abstract logger: Logger;

  protected abstract bullmqWorker: Worker | null;

  public abstract start(): Promise<void>;

  public async stop() {
    this.logger.info('Stopping...');

    if (this.bullmqWorker) {
      await this.bullmqWorker.close();
    }

    this.logger.info('Stopped');
  }
}
