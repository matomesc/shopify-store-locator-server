import { verifyShopifyRequest } from '@/server/lib/shopify';
import { NextApiRequest, NextApiResponse } from 'next';
import got from 'got';
import { config } from '@/server/config';
import { base64decode } from '@/server/lib/utils';
import { prisma } from '@/server/lib/prisma';
import { container } from 'tsyringe';
import { ShopService } from '@/server/services/ShopService';

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

  const result = await got
    .post(
      `https://${shopDomain}/admin/oauth/access_token?client_id=${config.NEXT_PUBLIC_SHOPIFY_CLIENT_ID}&client_secret=${config.SHOPIFY_CLIENT_SECRET}&code=${code}`,
    )
    .json<{ access_token: string; scope: string }>();

  let shop = await prisma.shop.findFirst({
    where: {
      domain: shopDomain,
    },
  });

  if ((shop && shop.uninstalledAt) || !shop) {
    // Setup app/uninstalled webhook
    const shopService = container.resolve(ShopService);
    await shopService.createAppUninstalledWebhook(
      shopDomain,
      result.access_token,
    );
  }

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

  const host = String(req.query.host);
  res.redirect(
    `https://${base64decode(host)}/apps/${
      config.NEXT_PUBLIC_SHOPIFY_CLIENT_ID
    }/dashboard?shop=${shopDomain}&host=${host}`,
  );
}
