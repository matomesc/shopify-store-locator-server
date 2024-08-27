import { PostSearchEventsInput, PostSearchEventsOutput } from '@/dto/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import cors from 'cors';
import { errorHandler, sendError } from '@/server/lib/api';
import { prisma } from '@/server/lib/prisma';
import * as Sentry from '@sentry/nextjs';

const router = createRouter<
  NextApiRequest,
  NextApiResponse<PostSearchEventsOutput>
>();

const corsMiddleware = cors();

router.use(corsMiddleware).post(async (req, res) => {
  const input = PostSearchEventsInput.safeParse(req.body);

  if (!input.success) {
    sendError(res, 'BadRequest', { zodError: input.error });
    return;
  }

  const session = await prisma.session.findFirst({
    where: {
      id: input.data.sessionId,
    },
  });

  if (!session) {
    sendError(res, 'BadRequest', { message: 'MissingSession' });
    return;
  }

  await prisma.searchEvent.create({
    data: {
      sessionId: input.data.sessionId,
      query: input.data.query,
      address: input.data.address,
      city: input.data.city,
      state: input.data.state,
      stateCode: input.data.stateCode,
      zip: input.data.zip,
      country: input.data.country,
      countryCode: input.data.countryCode,
      lat: input.data.lat,
      lng: input.data.lng,
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
