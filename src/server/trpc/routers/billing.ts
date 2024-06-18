import { TRPCError } from '@trpc/server';
import { container } from 'tsyringe';
import { BillingCreateChargeInput } from '../../../dto/trpc';
import { prisma } from '../../lib/prisma';
import { privateProcedure, router } from '../trpc';
import { ShopifyService } from '../../services/ShopifyService';
import { BillingService } from '../../services/BillingService';

export const billingRouter = router({
  createCharge: privateProcedure
    .input(BillingCreateChargeInput)
    .mutation(async ({ ctx, input }) => {
      const { shop } = ctx;

      const plan = await prisma.plan.findFirst({
        where: {
          id: input.planId,
        },
      });

      if (!plan) {
        throw new TRPCError({ message: 'PlanNotFound', code: 'BAD_REQUEST' });
      }

      const shopifyService = container.resolve(ShopifyService);
      const billingService = container.resolve(BillingService);

      const recurringApplicationCharge =
        await shopifyService.createRecurringApplicationCharge({
          shopDomain: shop.domain,
          accessToken: shop.accessToken,
          trialDays: billingService.getTrialDays({
            fullTrialDays: plan.trialDays,
            lastTrialAt: shop.lastTrialAt,
          }),
          plan,
        });

      return {
        charge: {
          confirmationUrl:
            recurringApplicationCharge.recurring_application_charge
              .confirmation_url,
        },
      };
    }),
});
