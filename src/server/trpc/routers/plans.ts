import { prisma } from '../../lib/prisma';
import { publicProcedure, router } from '../trpc';

export const plansRouter = router({
  getAll: publicProcedure.query(async () => {
    const plans = await prisma.plan.findMany({
      where: {
        enabled: true,
      },
    });

    return {
      plans: plans.map((plan) => {
        return {
          ...plan,
          price: plan.price.toNumber(),
        };
      }),
    };
  }),
});
