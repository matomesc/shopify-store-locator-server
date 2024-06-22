import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { verifyShopifyRequest } from '@/server/lib/shopify';
import { config } from '@/server/config';
import { base64decode } from '@/server/lib/utils';
import { prisma } from '@/server/lib/prisma';
import { ShopifyService } from '@/server/services/ShopifyService';
import { SettingsService } from '@/server/services/SettingsService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const validHmac = verifyShopifyRequest(req.query);

  if (!validHmac) {
    res.status(400).send('HMAC mismatch');
    return;
  }

  if (typeof req.query.shop !== 'string') {
    res.status(400).send('Missing shop param');
    return;
  }

  if (typeof req.query.code !== 'string') {
    res.status(400).send('Missing code param');
    return;
  }

  if (typeof req.query.host !== 'string') {
    res.status(400).send('Missing host param');
    return;
  }

  const { code, host, shop: shopDomain } = req.query;
  const shopifyService = container.resolve(ShopifyService);

  const result = await shopifyService.exchangeCodeForAccessToken({
    shopDomain,
    code,
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
    await settingsService.upsertSettings(shop.id);
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
}
