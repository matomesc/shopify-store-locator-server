import { prisma } from '@/server/lib/prisma';
import { privateProcedure, router } from '../trpc';

export const sessionsRouter = router({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const { shop } = ctx;

    const sessions = await prisma.session.findMany({
      where: {
        shopId: shop.id,
      },
      omit: {
        id: true,
        shopId: true,
        ip: true,
        region: true,
        regionName: true,
        city: true,
        zip: true,
        userAgent: true,
        browserName: true,
        browserVersion: true,
        deviceType: true,
        deviceModel: true,
        deviceVendor: true,
        engineName: true,
        engineVersion: true,
        osName: true,
        osVersion: true,
        cpuArchitecture: true,
        updatedAt: true,
      },
    });

    return {
      sessions,
    };
  }),
});
