import { prisma } from '@/server/lib/prisma';
import { container } from 'tsyringe';
import { SettingsService } from '@/server/services/SettingsService';
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
      const settingsService = container.resolve(SettingsService);
      settings = await settingsService.upsertSettings({
        shopId: shop.id,
        googleMapsApiKey: '',
        timezone: '',
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

      const settingsService = container.resolve(SettingsService);
      settings = await settingsService.upsertSettings({
        shopId: shop.id,
        googleMapsApiKey: input.googleMapsApiKey,
        timezone: input.timezone,
      });

      return {
        settings,
      };
    }),
});
