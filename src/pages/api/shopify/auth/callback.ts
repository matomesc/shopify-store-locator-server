import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { verifyShopifyRequest } from '@/server/lib/shopify';
import { config } from '@/server/config';
import { base64decode } from '@/server/lib/utils';
import { prisma } from '@/server/lib/prisma';
import { ShopifyService } from '@/server/services/ShopifyService';
import { SettingsService } from '@/server/services/SettingsService';
import { createRouter } from 'next-connect';
import { errorHandler, sendError } from '@/server/lib/api';
import { GetShopifyAuthCallbackInput } from '@/dto/api';
import * as Sentry from '@sentry/nextjs';

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

  if (shop && shop.uninstalledAt) {
    shop = await prisma.shop.update({
      where: {
        domain: shopDomain,
      },
      data: {
        installedAt: new Date(),
        uninstalledAt: null,
        accessToken: result.access_token,
        accessTokenScope: result.scope,
        planId: 'free',
        showPlansModal: true,
        showOnboarding: true,
      },
    });
  } else if (shop && !shop.uninstalledAt) {
    shop = await prisma.shop.update({
      where: {
        domain: shopDomain,
      },
      data: {
        accessToken: result.access_token,
        accessTokenScope: result.scope,
      },
    });
  } else if (!shop) {
    shop = await prisma.shop.create({
      data: {
        domain: shopDomain,
        accessToken: result.access_token,
        accessTokenScope: result.scope,
        installedAt: new Date(),
        planId: 'free',
        showPlansModal: true,
        showOnboarding: true,
      },
    });
    const settingsService = container.resolve(SettingsService);
    await settingsService.upsertSettings({
      shopId: shop.id,
      googleMapsApiKey: '',
      timezone:
        Intl.supportedValuesOf('timeZone').find(
          (value) => value === shopifyShop.shop.iana_timezone,
        ) || '',
    });
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
