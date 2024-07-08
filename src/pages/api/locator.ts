import { GetLocatorInput, GetLocatorOutput } from '@/dto/api';
import { errorHandler, sendError } from '@/server/lib/api';
import { BaseError } from '@/server/lib/error';
import { prisma } from '@/server/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

export const router = createRouter<
  NextApiRequest,
  NextApiResponse<GetLocatorOutput>
>();

router.get(async (req, res) => {
  const input = GetLocatorInput.safeParse(req.query);

  if (!input.success) {
    sendError(res, 'BadRequest', { zodError: input.error });
    return;
  }

  const shop = await prisma.shop.findFirst({
    where: {
      id: input.data.id,
    },
  });

  if (!shop) {
    sendError(res, 'BadRequest', { message: 'MissingShop' });
    return;
  }

  let locationLimit = 5;

  if (shop.planId === 'free') {
    locationLimit = 5;
  } else if (shop.planId === 'starter') {
    locationLimit = 300;
  } else if (shop.planId === 'pro') {
    locationLimit = 1000;
  } else if (shop.planId === 'enterprise') {
    locationLimit = 5000;
  } else if (shop.planId === 'unlimited') {
    locationLimit = 100000;
  }

  const [settings, searchFilters, customFields, customActions, locations] =
    await Promise.all([
      prisma.settings.findFirst({
        where: {
          shopId: input.data.id,
        },
      }),
      prisma.searchFilter.findMany({
        where: {
          shopId: shop.id,
          enabled: true,
        },
      }),
      prisma.customField.findMany({
        where: {
          shopId: input.data.id,
          enabled: true,
        },
      }),
      prisma.customAction.findMany({
        where: {
          shopId: input.data.id,
          enabled: true,
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
          },
          customFieldValues: true,
          customActionValues: true,
        },
        take: locationLimit,
      }),
    ]);

  if (!settings) {
    sendError(res, 'BadRequest', { message: 'Missing settings' });
    return;
  }

  if (!settings.googleMapsApiKey) {
    sendError(res, 'BadRequest', { message: 'Missing Google Maps API key' });
    return;
  }

  const output = GetLocatorOutput.safeParse({
    ok: true,
    settings: {
      googleMapsApiKey: settings.googleMapsApiKey,
    },
    searchFilters,
    customFields,
    customActions,
    locations,
  } as GetLocatorOutput);

  if (output.success) {
    res.json(output.data);
  } else {
    throw new BaseError('Invalid output', 'InvalidOutput', {
      output,
    });
  }
});

export default router.handler({
  onError: errorHandler,
});
