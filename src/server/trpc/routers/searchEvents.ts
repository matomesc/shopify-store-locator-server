import { prisma } from '@/server/lib/prisma';
import { privateProcedure, router } from '../trpc';

export const searchEventsRouter = router({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const { shop } = ctx;

    const searchEvents = await prisma.searchEvent.findMany({
      where: {
        session: {
          shopId: shop.id,
        },
      },
      omit: {
        id: true,
        sessionId: true,
        query: true,
        address: true,
        city: true,
        state: true,
        stateCode: true,
        zip: true,
        countryCode: true,
      },
    });

    return {
      searchEvents,
    };
  }),
});
