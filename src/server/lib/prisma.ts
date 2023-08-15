import { PrismaClient } from '@prisma/client';
import { config } from '../config';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var prismaClient: PrismaClient;
}

if (!globalThis.prismaClient) {
  globalThis.prismaClient = new PrismaClient({
    datasources: {
      db: {
        url: `${config.DATABASE_URL}?connection_limit=${config.DATABASE_CONNECTION_LIMIT}`,
      },
    },
  });
}

export const prisma = globalThis.prismaClient;
