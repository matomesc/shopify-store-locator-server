import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { verifyShopifyRequest } from '@/server/lib/shopify';
import { config } from '@/server/config';
import { base64decode } from '@/server/lib/utils';
import { prisma } from '@/server/lib/prisma';
import { ShopifyService } from '@/server/services/ShopifyService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const validHmac = verifyShopifyRequest(req.query);

  if (!validHmac) {
    res.status(400).send('HMAC mismatch');
    return;
  }

  const shopDomain = String(req.query.shop);
  const code = String(req.query.code);
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
        scope: result.scope,
      },
    });
  } else if (shop && !shop.uninstalledAt) {
    shop = await prisma.shop.update({
      where: {
        domain: shopDomain,
      },
      data: {
        accessToken: result.access_token,
        scope: result.scope,
      },
    });
  } else if (!shop) {
    shop = await prisma.shop.create({
      data: {
        domain: shopDomain,
        accessToken: result.access_token,
        scope: result.scope,
        installedAt: new Date(),
      },
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

  const host = String(req.query.host);
  res.redirect(
    `https://${base64decode(host)}/apps/${
      config.NEXT_PUBLIC_SHOPIFY_CLIENT_ID
    }/dashboard?shop=${shopDomain}&host=${host}`,
  );
}
