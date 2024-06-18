import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';
import { prisma } from '../lib/prisma';
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create();

const isAuthed = t.middleware(async ({ next, ctx }) => {
  if (!ctx.shopDomain) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const shop = await prisma.shop.findFirst({
    where: {
      domain: ctx.shopDomain,
    },
  });

  if (!shop) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      shop,
    },
  });
});

// Base router and procedure helpers
export const { router } = t;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuthed);
