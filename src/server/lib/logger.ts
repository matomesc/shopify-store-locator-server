import pino from 'pino';
import { config } from '../config';

// Configure the base logger. In development, we have pretty colored logs while
// in production only json.
export const logger =
  config.NEXT_PUBLIC_APP_ENV === 'development'
    ? pino({
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      })
    : pino({
        level: 'info',
      });
