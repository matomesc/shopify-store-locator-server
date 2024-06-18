import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { procedure, router } from '../trpc';

export const appRouter = router({
  hello: procedure
    .input(
      z.object({
        text: z.string().regex(/^Hello$/gi),
      }),
    )
    .query(({ input, ctx }) => {
      if (!ctx.shopDomain) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      return {
        greeting: `${input.text} ${ctx.shopDomain}`,
      };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
