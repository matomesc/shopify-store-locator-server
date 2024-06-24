import { prisma } from '@/server/lib/prisma';
import {
  LocationsCreateInput,
  LocationsDeleteInput,
  LocationsDeleteManyInput,
  LocationsGetByIdInput,
  LocationsUpdateInput,
} from '@/dto/trpc';
import { TRPCError } from '@trpc/server';
import { privateProcedure, router } from '../trpc';

export const locationsRouter = router({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const { shop } = ctx;
    const locations = await prisma.location.findMany({
      where: {
        shopId: shop.id,
      },
    });

    return {
      locations,
    };
  }),
  getById: privateProcedure
    .input(LocationsGetByIdInput)
    .query(async ({ input }) => {
      const location = await prisma.location.findFirst({
        where: {
          id: input.id,
        },
        include: {
          searchFilters: true,
        },
      });

      if (!location) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'LocationNotFound' });
      }

      return {
        location,
      };
    }),
  create: privateProcedure
    .input(LocationsCreateInput)
    .mutation(async ({ ctx, input }) => {
      const { shop } = ctx;

      const location = await prisma.location.create({
        data: {
          id: input.id,
          name: input.name,
          active: input.active,
          email: input.email,
          phone: input.phone,
          website: input.website,
          address1: input.address1,
          address2: input.address2,
          city: input.city,
          state: input.state,
          zip: input.zip,
          country: input.country,
          lat: input.lat,
          lng: input.lng,
          shopId: shop.id,
          searchFilters: {
            connect: input.searchFilters.map((sf) => {
              return { id: sf };
            }),
          },
        },
      });

      return {
        location,
      };
    }),
  update: privateProcedure
    .input(LocationsUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const { shop } = ctx;

      let location = await prisma.location.findFirst({
        where: {
          id: input.id,
          shopId: shop.id,
        },
      });

      if (!location) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'LocationNotFound' });
      }

      location = await prisma.location.update({
        where: {
          id: location.id,
        },
        data: {
          name: input.name,
          active: input.active,
          email: input.email,
          phone: input.phone,
          website: input.website,
          address1: input.address1,
          address2: input.address2,
          city: input.city,
          state: input.state,
          zip: input.zip,
          country: input.country,
          lat: input.lat,
          lng: input.lng,
          shopId: shop.id,
          searchFilters: {
            connect: input.searchFilters.map((sf) => {
              return { id: sf };
            }),
          },
        },
      });

      return {
        location,
      };
    }),
  delete: privateProcedure
    .input(LocationsDeleteInput)
    .mutation(async ({ ctx, input }) => {
      const { shop } = ctx;
      const location = await prisma.location.findFirst({
        where: {
          id: input.id,
          shopId: shop.id,
        },
      });

      if (!location) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'LocationNotFound' });
      }

      await prisma.location.delete({
        where: {
          id: location.id,
        },
      });
    }),
  deleteMany: privateProcedure
    .input(LocationsDeleteManyInput)
    .mutation(async ({ ctx, input }) => {
      const { shop } = ctx;

      // This won't throw if no locations are matched
      await prisma.location.deleteMany({
        where: {
          id: {
            in: input.ids,
          },
          shopId: shop.id,
        },
      });
    }),
});
