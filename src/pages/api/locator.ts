import { GetLocatorInput, GetLocatorOutput } from '@/dto/api';
import { errorHandler, sendError } from '@/server/lib/api';
import { prisma } from '@/server/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import cors from 'cors';

export const router = createRouter<
  NextApiRequest,
  NextApiResponse<GetLocatorOutput>
>();

router.use(cors()).get(async (req, res) => {
  const input = GetLocatorInput.safeParse(req.query);

  if (!input.success) {
    sendError(res, 'BadRequest', { zodError: input.error });
    return;
  }

  const shop = await prisma.shop.findFirst({
    where: {
      id: input.data.id,
    },
    include: {
      plan: true,
    },
  });

  if (!shop) {
    sendError(res, 'BadRequest', { message: 'MissingShop' });
    return;
  }

  const [
    settings,
    locations,
    searchFilters,
    customFields,
    customActions,
    languages,
  ] = await Promise.all([
    prisma.settings.findFirst({
      where: {
        shopId: input.data.id,
      },
      omit: {
        timezone: true,
        shopId: true,
      },
    }),
    prisma.location.findMany({
      where: {
        shopId: input.data.id,
        active: true,
      },
      include: {
        searchFilters: {
          where: {
            enabled: true,
          },
          select: {
            id: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
        customFieldValues: {
          where: {
            customField: {
              enabled: true,
            },
          },
          select: {
            id: true,
            value: true,
            customFieldId: true,
          },
          orderBy: {
            customField: {
              position: 'asc',
            },
          },
        },
        customActionValues: {
          where: {
            customAction: {
              enabled: true,
            },
          },
          select: {
            id: true,
            value: true,
            customActionId: true,
          },
          orderBy: {
            customAction: {
              position: 'asc',
            },
          },
        },
      },
      take: shop.plan.locationsLimit,
    }),
    prisma.searchFilter.findMany({
      where: {
        shopId: shop.id,
        enabled: true,
      },
      orderBy: {
        position: 'asc',
      },
    }),
    prisma.customField.findMany({
      where: {
        shopId: input.data.id,
        enabled: true,
      },
      orderBy: {
        position: 'asc',
      },
    }),
    prisma.customAction.findMany({
      where: {
        shopId: input.data.id,
        enabled: true,
      },
      orderBy: {
        position: 'asc',
      },
    }),
    prisma.language.findMany({
      where: {
        shopId: shop.id,
        enabled: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: shop.plan.languagesLimit - 1,
    }),
  ]);

  if (!settings) {
    sendError(res, 'BadRequest', { message: 'MissingSettings' });
    return;
  }

  if (!settings.googleMapsApiKey) {
    sendError(res, 'BadRequest', { message: 'MissingGoogleMapsAPIKey' });
    return;
  }

  // First try to find a language that matches the whole input language code
  let language = languages.find((l) => {
    return l.code.toLowerCase() === input.data.language.toLowerCase();
  });

  // If no languages was found for the whole input language code, try to find a
  // language that matches just the part before the -
  if (!language) {
    language = languages.find((l) => {
      return (
        l.code.toLowerCase() === input.data.language.split('-')[0].toLowerCase()
      );
    });
  }

  const translations = language
    ? await prisma.translation.findMany({
        where: {
          OR: [
            { target: { not: null }, languageId: language.id },
            {
              searchFilterId: { not: null },
              searchFilter: { enabled: true },
              languageId: language.id,
            },
            {
              customFieldId: { not: null },
              customField: { enabled: true },
              languageId: language.id,
            },
            {
              customActionId: { not: null },
              customAction: { enabled: true },
              languageId: language.id,
            },
          ],
        },
        select: {
          id: true,
          value: true,
          target: true,
          searchFilterId: true,
          customFieldId: true,
          customActionId: true,
        },
      })
    : [];

  res.json({
    ok: true,
    settings,
    searchFilters,
    customFields,
    customActions,
    locations: locations.map((location) => {
      return {
        ...location,
        searchFilters: location.searchFilters.map((searchFilter) => {
          return searchFilter.id;
        }),
      };
    }),
    translations,
  });
});

export default router.handler({
  onError: errorHandler,
});
