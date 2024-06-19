import { prisma } from '@/server/lib/prisma';
import { container } from 'tsyringe';
import { ShopifyService } from '@/server/services/ShopifyService';
import { ShopsUpdateInput } from '@/dto/trpc';
import { privateProcedure, router } from '../trpc';
import { BaseError } from '../../lib/error';

export const shopsRouter = router({
  get: privateProcedure.query(async ({ ctx }) => {
    const { shop } = ctx;

    // Load plan
    const plan = await prisma.plan.findFirst({
      where: {
        id: shop.planId,
      },
    });

    if (!plan) {
      // Shouldn't happen
      throw new BaseError('Shop plan is missing', 'ShopPlanMissing');
    }

    const shopifyService = container.resolve(ShopifyService);

    let charge = null;

    if (shop.planChargeId) {
      charge = await shopifyService.getRecurringApplicationCharge({
        shopDomain: shop.domain,
        accessToken: shop.accessToken,
        chargeId: shop.planChargeId,
      });
    }

    return {
      shop: {
        domain: shop.domain,
        planId: shop.planId,
        plan: { ...plan, price: plan.price.toNumber() },
        planCharge: charge
          ? {
              status: charge.recurring_application_charge.status,
              price: Number.parseFloat(
                charge.recurring_application_charge.price,
              ),
            }
          : null,
        // showSetupBanner: shop.showSetupBanner,
        showPlansModal: shop.showPlansModal,
      },
    };
  }),
  update: privateProcedure
    .input(ShopsUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const { shop } = ctx;

      // Handle downgrading to the free plan
      if (shop.planId !== 'free' && input.planId === 'free') {
        if (shop.planChargeId) {
          // If the shop's plan isn't free then it should theoretically have a
          // charge id, so cancel the recurring application charge
          const shopifyService = container.resolve(ShopifyService);
          await shopifyService.cancelRecurringApplicationCharge({
            shopDomain: shop.domain,
            accessToken: shop.accessToken,
            chargeId: shop.planChargeId,
          });
        }

        // Update shop plan
        await prisma.shop.update({
          where: {
            id: shop.id,
          },
          data: {
            planId: input.planId,
            planChargeId: null,
          },
        });
      }

      // Update shop
      await prisma.shop.update({
        where: {
          id: shop.id,
        },
        data: {
          // showSetupBanner: input.showSetupBanner,
          showPlansModal: input.showPlansModal,
        },
      });
    }),
});
