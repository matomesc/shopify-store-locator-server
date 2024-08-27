import { prisma } from '@/server/lib/prisma';
import { LocationClickEventsGetCountByLocationInput } from '@/dto/trpc';
import { privateProcedure, router } from '../trpc';

export const locationClickEventsRouter = router({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const { shop } = ctx;

    const locationClickEvents = await prisma.locationClickEvent.findMany({
      where: {
        location: {
          shopId: shop.id,
        },
      },
      select: {
        locationId: true,
        createdAt: true,
      },
    });

    return {
      locationClickEvents,
    };
  }),
  getCountByLocation: privateProcedure
    .input(LocationClickEventsGetCountByLocationInput)
    .query(async ({ input, ctx }) => {
      const { shop } = ctx;

      const groupByResult = await prisma.locationClickEvent.groupBy({
        by: ['locationId'],
        where: {
          location: {
            shopId: shop.id,
          },
          createdAt: {
            gt: input.createdAfter,
          },
        },
        _count: {
          locationId: true,
        },
        orderBy: {
          _count: {
            locationId: 'desc',
          },
        },
      });

      const locations = await prisma.location.findMany({
        where: {
          id: {
            in: groupByResult.map((result) => result.locationId),
          },
        },
      });

      const locationsById = locations.reduce(
        (acc, location) => {
          acc[location.id] = location;
          return acc;
        },
        {} as Record<string, (typeof locations)[number]>,
      );

      return {
        countByLocation: groupByResult.map((result) => {
          const location = locationsById[result.locationId];

          return {
            // eslint-disable-next-line no-underscore-dangle
            count: result._count,
            location: {
              id: result.locationId,
              name: location.name,
              address1: location.address1,
              address2: location.address2,
              city: location.city,
              state: location.state,
              zip: location.zip,
              country: location.country,
            },
          };
        }),
      };
    }),
});
