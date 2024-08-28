import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { verifyShopifyRequest } from '@/server/lib/shopify';
import { config } from '@/server/config';
import { base64decode } from '@/server/lib/utils';
import { prisma } from '@/server/lib/prisma';
import { ShopifyService } from '@/server/services/ShopifyService';
import { createRouter } from 'next-connect';
import { errorHandler, sendError } from '@/server/lib/api';
import { GetShopifyAuthCallbackInput } from '@/dto/api';
import * as Sentry from '@sentry/nextjs';
import { timezones } from '@/lib/timezones';
import { Prisma } from '@prisma/client';
import { SlackService } from '@/server/services/SlackService';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
  const validHmac = verifyShopifyRequest(req.query);

  if (!validHmac) {
    // We theoretically shouldn't get here
    sendError(res, 'BadRequest', { message: 'HMAC mismatch' });
    Sentry.captureMessage('Oauth hmac mismatch', {
      level: 'error',
      extra: {
        query: req.query,
      },
    });
    return;
  }

  const input = GetShopifyAuthCallbackInput.safeParse(req.query);

  if (!input.success) {
    sendError(res, 'BadRequest', {
      message: 'Invalid input',
      zodError: input.error,
    });
    Sentry.captureMessage('Invalid oauth callback params', {
      level: 'error',
      extra: {
        query: req.query,
      },
    });
    return;
  }

  const { code, host, shop: shopDomain } = input.data;
  const shopifyService = container.resolve(ShopifyService);

  const result = await shopifyService.exchangeCodeForAccessToken({
    shopDomain,
    code,
  });

  const shopifyShop = await shopifyService.getShop({
    shopDomain,
    accessToken: result.access_token,
  });

  let shop = await prisma.shop.findFirst({
    where: {
      domain: shopDomain,
    },
  });

  const slackService = container.resolve(SlackService);

  if (shop && shop.uninstalledAt) {
    shop = await prisma.shop.update({
      where: {
        domain: shopDomain,
      },
      data: {
        name: shopifyShop.shop.name,
        email: shopifyShop.shop.email,
        ownerName: shopifyShop.shop.shop_owner,
        phone: shopifyShop.shop.phone,
        customDomain: shopifyShop.shop.domain,
        installedAt: new Date(),
        uninstalledAt: null,
        accessToken: result.access_token,
        accessTokenScope: result.scope,
        planId: 'free',
        showPlansModal: true,
        showOnboarding: true,
        shopifyRawData: shopifyShop.shop as Prisma.JsonObject,
      },
    });
    try {
      await slackService.postInstallMessage({
        domain: shop.domain,
        email: shop.email,
        name: shop.name,
        ownerName: shop.ownerName,
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  } else if (shop && !shop.uninstalledAt) {
    shop = await prisma.shop.update({
      where: {
        domain: shopDomain,
      },
      data: {
        accessToken: result.access_token,
        accessTokenScope: result.scope,
        email: shopifyShop.shop.email,
      },
    });
  } else if (!shop) {
    shop = await prisma.shop.create({
      data: {
        domain: shopDomain,
        name: shopifyShop.shop.name,
        email: shopifyShop.shop.email,
        ownerName: shopifyShop.shop.shop_owner,
        phone: shopifyShop.shop.phone,
        customDomain: shopifyShop.shop.domain,
        accessToken: result.access_token,
        accessTokenScope: result.scope,
        installedAt: new Date(),
        planId: 'free',
        showPlansModal: true,
        showOnboarding: true,
        shopifyRawData: shopifyShop.shop as Prisma.JsonObject,
        settings: {
          create: {
            googleMapsApiKey: '',
            // Attempt to match shopify's timezone with one of the supported node
            // timezones. If no match is found, defaults to UTC.
            timezone:
              timezones.find((tz) => tz === shopifyShop.shop.iana_timezone) ||
              'UTC',
            borderRadius: '0px',
            searchInputBorderColor: '#000000',
            searchInputBackgroundColor: '#FFFFFF',
            searchInputPlaceholderColor: '#636C72',
            searchButtonTextColor: '#FFFFFF',
            searchButtonBackgroundColor: '#000000',
            searchButtonHoverBackgroundColor: '#000000',
            searchFilterTextColor: '#000000',
            searchFilterBackgroundColor: '#EEEEEE',
            searchFilterHoverBackgroundColor: '#EEEEEE',
            searchFilterSelectedBorderColor: '#000000',
            searchFilterSelectedBackgroundColor: '#EEEEEE',
            searchFilterSelectedHoverBackgroundColor: '#EEEEEE',
            listLocationNameColor: '#000000',
            listTextColor: '#000000',
            listLinkColor: '#000000',
            listSearchFilterColor: '#000000',
            listCustomActionTextColor: '#FFFFFF',
            listCustomActionBackgroundColor: '#000000',
            listCustomActionHoverBackgroundColor: '#000000',
            listSelectedLocationBorderColor: '#000000',
            listPinAndDistanceColor: '#000000',
            mapMarkerType: 'pin',
            mapMarkerBackgroundColor: '#E7453C',
            mapMarkerBorderColor: '#CC2E2B',
            mapMarkerGlyphColor: '#B1171C',
            mapMarkerImage: '',
            mapLocationNameColor: '#000000',
            mapTextColor: '#000000',
            mapLinkColor: '#000000',
            mapSearchFilterColor: '#000000',
            mapCustomActionTextColor: '#FFFFFF',
            mapCustomActionBackgroundColor: '#000000',
            mapCustomActionHoverBackgroundColor: '#000000',
          },
        },
      },
    });

    try {
      await slackService.postInstallMessage({
        domain: shop.domain,
        email: shop.email,
        name: shop.name,
        ownerName: shop.ownerName,
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  // Setup app/uninstalled webhook
  const { webhooks } = await shopifyService.getWebhooks({
    shopDomain,
    accessToken: shop.accessToken,
  });
  if (!webhooks.find((w) => w.topic === 'app/uninstalled')) {
    await shopifyService.createWebhook({
      shopDomain,
      accessToken: result.access_token,
      topic: 'app/uninstalled',
    });
  }

  // Redirect to dashboard
  res.redirect(
    `https://${base64decode(host)}/apps/${
      config.NEXT_PUBLIC_SHOPIFY_CLIENT_ID
    }/dashboard`,
  );
});

export default router.handler({
  onError: errorHandler,
});
