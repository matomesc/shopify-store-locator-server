import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import cors from 'cors';
import {
  PostSessionsInput,
  PostSessionsOutput,
  PutSessionsInput,
  PutSessionsOutput,
} from '@/dto/api';
import { errorHandler, sendError } from '@/server/lib/api';
import { prisma } from '@/server/lib/prisma';
import * as Sentry from '@sentry/nextjs';
import UAParser from 'ua-parser-js';

const corsMiddleware = cors();

const router = createRouter<
  NextApiRequest,
  NextApiResponse<PostSessionsOutput | PutSessionsOutput>
>();

router
  .use(corsMiddleware)
  .post(async (req, res) => {
    const input = PostSessionsInput.safeParse(req.body);

    if (!input.success) {
      sendError(res, 'BadRequest', { zodError: input.error });
      return;
    }

    const shop = await prisma.shop.findFirst({
      where: {
        id: input.data.shopId,
      },
    });

    if (!shop) {
      sendError(res, 'BadRequest', { message: 'MissingShop' });
      return;
    }

    const userAgentParseResult = UAParser(input.data.userAgent);

    await prisma.session.create({
      data: {
        id: input.data.id,
        shopId: input.data.shopId,
        ip: input.data.ip,
        country: input.data.country,
        countryCode: input.data.countryCode,
        region: input.data.region,
        regionName: input.data.regionName,
        city: input.data.city,
        zip: input.data.zip,
        ipGeolocationLat: input.data.ipGeolocationLat,
        ipGeolocationLng: input.data.ipGeolocationLng,
        browserGeolocationLat: input.data.browserGeolocationLat,
        browserGeolocationLng: input.data.browserGeolocationLng,
        language: input.data.language,
        mobile: input.data.mobile,
        userAgent: input.data.userAgent,
        browserName: userAgentParseResult.browser.name || '',
        browserVersion: userAgentParseResult.browser.version || '',
        deviceType: userAgentParseResult.device.type || '',
        deviceModel: userAgentParseResult.device.model || '',
        deviceVendor: userAgentParseResult.device.vendor || '',
        engineName: userAgentParseResult.engine.name || '',
        engineVersion: userAgentParseResult.engine.version || '',
        osName: userAgentParseResult.os.name || '',
        osVersion: userAgentParseResult.os.version || '',
        cpuArchitecture: userAgentParseResult.cpu.architecture || '',
      },
    });

    res.json({ ok: true });
  })
  .put(async (req, res) => {
    const input = PutSessionsInput.safeParse(req.body);

    if (!input.success) {
      sendError(res, 'BadRequest', { zodError: input.error });
      return;
    }

    const session = await prisma.session.findFirst({
      where: {
        id: input.data.id,
      },
    });

    if (!session) {
      sendError(res, 'BadRequest', { message: 'MissingSession' });
      return;
    }

    await prisma.session.update({
      where: {
        id: input.data.id,
      },
      data: {
        browserGeolocationLat: input.data.browserGeolocationLat,
        browserGeolocationLng: input.data.browserGeolocationLng,
      },
    });

    res.json({ ok: true });
  });

const routerHandler = router.handler({
  onError: errorHandler,
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // We need this workaround because next-connect doesn't support OPTIONS requests
  // so we use the default Nextjs handler to pass the OPTIONS requests to the cors
  // middleware directly
  if (req.method === 'OPTIONS') {
    corsMiddleware(req, res, () => {});
  } else {
    routerHandler(req, res).catch((err) => Sentry.captureException(err));
  }
}
