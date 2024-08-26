import { NextApiRequest, NextApiResponse } from 'next';
import { getRawBody } from '@/server/lib/http';
import { prisma } from '@/server/lib/prisma';
import { verifyShopifyWebhook } from '@/server/lib/shopify';
import { container } from 'tsyringe';
import { SlackService } from '@/server/services/SlackService';
import * as Sentry from '@sentry/nextjs';

interface WebhookParams {
  body: unknown;
  shopDomain: string;
  res: NextApiResponse;
}

async function handleCustomersDataRequest({ res }: WebhookParams) {
  res.status(200).json({ ok: true });
}

async function handleCustomersRedact({ res }: WebhookParams) {
  res.status(200).json({ ok: true });
}

async function handleShopRedact({ res }: WebhookParams) {
  res.status(200).json({ ok: true });
}

async function handleAppUninstalled({ shopDomain, res }: WebhookParams) {
  const shop = await prisma.shop.findFirst({
    where: {
      domain: shopDomain,
    },
  });

  await prisma.shop.update({
    where: {
      domain: shopDomain,
    },
    data: {
      uninstalledAt: new Date(),
      planId: 'free',
      planChargeId: null,
    },
  });

  const slackService = container.resolve(SlackService);

  if (shop) {
    try {
      await slackService.postUninstallMessage({
        domain: shop.domain,
        email: shop.email,
        name: shop.name,
        ownerName: shop.ownerName,
      });
    } catch (err) {
      Sentry.captureException(err);
    }
  }

  res.status(200).json({});
}

export const config = {
  api: {
    bodyParser: false,
  },
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const rawBody = (await getRawBody(req)).toString('utf8');
  const hmac = String(req.headers['x-shopify-hmac-sha256']);
  const verified = verifyShopifyWebhook(hmac, rawBody);
  if (!verified) {
    res.status(401).send('Invalid HMAC');
    return;
  }

  const body = JSON.parse(rawBody) as unknown;
  const shopDomain = String(req.headers['x-shopify-shop-domain']);
  const topic = String(req.headers['x-shopify-topic']);

  switch (topic) {
    case 'customers/data_request':
      await handleCustomersDataRequest({ body, shopDomain, res });
      break;
    case 'customers/redact':
      await handleCustomersRedact({ body, shopDomain, res });
      break;
    case 'shop/redact':
      await handleShopRedact({ body, shopDomain, res });
      break;
    case 'app/uninstalled':
      await handleAppUninstalled({ body, shopDomain, res });
      break;
    default:
      res.status(400).send('Bad request');
  }
}
