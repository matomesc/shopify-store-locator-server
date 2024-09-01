import { errorHandler } from '@/server/lib/api';
import { prisma } from '@/server/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
  await prisma.shop.findFirst();

  res.json({
    ok: true,
  });
});

export default router.handler({
  onError: errorHandler,
});
