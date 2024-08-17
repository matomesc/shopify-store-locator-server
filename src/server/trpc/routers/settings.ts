import { prisma } from '@/server/lib/prisma';
import { SettingsUpdateInput } from '@/dto/trpc';
import { TRPCError } from '@trpc/server';
import { privateProcedure, router } from '../trpc';

export const settingsRouter = router({
  get: privateProcedure.query(async ({ ctx }) => {
    const { shop } = ctx;

    const settings = await prisma.settings.findFirst({
      where: {
        shopId: shop.id,
      },
    });

    if (!settings) {
      // Should not get here since we create the settings when we create the
      // shop
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'SettingsNotFound',
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

      // TODO move this check into the zod schema using .refine() when zod 4
      // drops. See this issue
      // https://github.com/neuteklabs/neutek-locator/issues/19
      if (input.mapMarkerType === 'image' && !input.mapMarkerImage) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'MissingMapMarkerImage',
        });
      }

      let settings = await prisma.settings.findFirst({
        where: {
          shopId: shop.id,
        },
      });

      if (!settings) {
        // Should not get here since we create the settings when we create the
        // shop
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'SettingsNotFound',
        });
      }

      settings = await prisma.settings.update({
        where: {
          id: settings.id,
        },
        data: {
          googleMapsApiKey: input.googleMapsApiKey,
          timezone: input.timezone,
          borderRadius: input.borderRadius,
          searchInputBorderColor: input.searchInputBorderColor,
          searchInputBackgroundColor: input.searchInputBackgroundColor,
          searchInputPlaceholderColor: input.searchInputPlaceholderColor,
          searchButtonTextColor: input.searchButtonTextColor,
          searchButtonBackgroundColor: input.searchButtonBackgroundColor,
          searchButtonHoverBackgroundColor:
            input.searchButtonHoverBackgroundColor,
          searchFilterTextColor: input.searchFilterTextColor,
          searchFilterBackgroundColor: input.searchFilterBackgroundColor,
          searchFilterHoverBackgroundColor:
            input.searchFilterHoverBackgroundColor,
          searchFilterSelectedBorderColor:
            input.searchFilterSelectedBorderColor,
          searchFilterSelectedBackgroundColor:
            input.searchFilterSelectedBackgroundColor,
          searchFilterSelectedHoverBackgroundColor:
            input.searchFilterSelectedHoverBackgroundColor,
          listLocationNameColor: input.listLocationNameColor,
          listTextColor: input.listTextColor,
          listLinkColor: input.listLinkColor,
          listSearchFilterColor: input.listSearchFilterColor,
          listCustomActionTextColor: input.listCustomActionTextColor,
          listCustomActionBackgroundColor:
            input.listCustomActionBackgroundColor,
          listCustomActionHoverBackgroundColor:
            input.listCustomActionHoverBackgroundColor,
          mapMarkerType: input.mapMarkerType,
          mapMarkerBackgroundColor: input.mapMarkerBackgroundColor,
          mapMarkerBorderColor: input.mapMarkerBorderColor,
          mapMarkerGlyphColor: input.mapMarkerGlyphColor,
          mapMarkerImage: input.mapMarkerImage,
          mapLocationNameColor: input.mapLocationNameColor,
          mapTextColor: input.mapTextColor,
          mapLinkColor: input.mapLinkColor,
          mapSearchFilterColor: input.mapSearchFilterColor,
          mapCustomActionTextColor: input.mapCustomActionTextColor,
          mapCustomActionBackgroundColor: input.mapCustomActionBackgroundColor,
          mapCustomActionHoverBackgroundColor:
            input.mapCustomActionHoverBackgroundColor,
        },
      });

      return {
        settings,
      };
    }),
});
