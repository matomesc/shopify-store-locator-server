import { prisma } from '@/server/lib/prisma';
import { SettingsUpdateInput } from '@/dto/trpc';
import { privateProcedure, router } from '../trpc';

export const settingsRouter = router({
  get: privateProcedure.query(async ({ ctx }) => {
    const { shop } = ctx;

    let settings = await prisma.settings.findFirst({
      where: {
        shopId: shop.id,
      },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          shopId: shop.id,
          googleMapsApiKey: '',
          timezone: '',
        },
      });
    }

    return {
      settings,
    };
  }),
  update: privateProcedure
    .input(SettingsUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const { shop } = ctx;

      let settings = await prisma.settings.findFirst({
        where: {
          shopId: shop.id,
        },
      });

      if (settings) {
        settings = await prisma.settings.update({
          where: {
            id: settings.id,
          },
          data: {
            googleMapsApiKey: input.googleMapsApiKey,
            timezone: input.timezone,
          },
        });
      } else {
        settings = await prisma.settings.create({
          data: {
            shopId: shop.id,
            googleMapsApiKey: input.googleMapsApiKey,
            timezone: input.timezone,
          },
        });
      }

      return {
        settings,
      };
    }),
});
