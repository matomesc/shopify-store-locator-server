import {
  PostLocationClickEventsInput,
  PostLocationClickEventsOutput,
} from '@/dto/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import cors from 'cors';
import { errorHandler, sendError } from '@/server/lib/api';
import { prisma } from '@/server/lib/prisma';
import * as Sentry from '@sentry/nextjs';

const router = createRouter<
  NextApiRequest,
  NextApiResponse<PostLocationClickEventsOutput>
>();

const corsMiddleware = cors();

router.use(corsMiddleware).post(async (req, res) => {
  const input = PostLocationClickEventsInput.safeParse(req.body);

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

  await prisma.locationClickEvent.create({
    data: {
      sessionId: input.data.sessionId,
      locationId: input.data.locationId,
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
