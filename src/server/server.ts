import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import * as Sentry from '@sentry/nextjs';
import { createHttpTerminator } from 'http-terminator';
import { config } from './config';
import { logger } from './lib/logger';
import '../../sentry.server.config';

const port = config.PORT;
const dev = config.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const serverLogger = logger.child({ ref: 'server' });

app
  .prepare()
  .then(() => {
    // eslint-disable-next-line consistent-return
    const server = createServer((req, res) => {
      if (!req.url) {
        Sentry.captureMessage('req.url is not set', { level: 'error' });
        res.statusCode = 500;
        return res.end(
          JSON.stringify({
            ok: false,
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Internal Server Error',
            },
          }),
        );
      }

      const parsedUrl = parse(req.url, true);

      handle(req, res, parsedUrl).catch((err) => {
        Sentry.captureException(err);
        res.statusCode = 500;
        return res.end(
          JSON.stringify({
            ok: false,
            error: {
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Internal Server Error',
            },
          }),
        );
      });
    }).listen(port, '0.0.0.0');

    const terminator = createHttpTerminator({
      server,
      // TODO switch to render blueprints to increase this value to 300
      gracefulTerminationTimeout: 30,
    });

    const gracefulShutdown = async (signal: string) => {
      serverLogger.info(`Received ${signal}, terminating server...`);

      await terminator.terminate();

      serverLogger.info('Server terminated');

      process.exit(0);
    };

    process.on('SIGINT', () => {
      gracefulShutdown('SIGINT').catch((err) => {
        Sentry.captureException(err);
      });
    });

    process.on('SIGTERM', () => {
      gracefulShutdown('SIGTERM').catch((err) => {
        Sentry.captureException(err);
      });
    });

    serverLogger.info(`> Server listening at http://0.0.0.0:${port}`);
  })
  .catch((err) => {
    Sentry.captureException(err);
  });
