import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var prismaClient: PrismaClient;
}

if (!globalThis.prismaClient) {
  globalThis.prismaClient = new PrismaClient();
}

export const prisma = globalThis.prismaClient;
