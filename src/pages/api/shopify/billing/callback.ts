import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { errorHandler, sendError } from '@/server/lib/api';
import { GetShopifyBillingCallbackInput } from '@/dto/api';
import { prisma } from '@/server/lib/prisma';
import { config } from '@/server/config';
import { container } from 'tsyringe';
import { ShopifyService } from '@/server/services/ShopifyService';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
  const input = GetShopifyBillingCallbackInput.safeParse(req.query);

  if (!input.success) {
    return sendError(res, 'BadRequest', {
      message: 'Invalid input',
      zodError: input.error,
    });
  }

  const { shopDomain, charge_id: chargeId, planId } = input.data;

  const shop = await prisma.shop.findFirst({
    where: {
      domain: shopDomain,
    },
  });

  if (!shop) {
    return sendError(res, 'BadRequest', { message: 'Invalid shop' });
  }

  const plan = await prisma.plan.findFirst({
    where: {
      id: planId,
      enabled: true,
    },
  });

  if (!plan) {
    return sendError(res, 'BadRequest', { message: 'Invalid plan' });
  }

  const shopifyService = container.resolve(ShopifyService);
  const charge = await shopifyService.getRecurringApplicationCharge({
    shopDomain,
    accessToken: shop.accessToken,
    chargeId,
  });

  if (
    charge.recurring_application_charge.activated_on &&
    charge.recurring_application_charge.status === 'active' &&
    charge.recurring_application_charge.name.includes(plan.name)
  ) {
    // A full trial is considered to be started if the number of trial days in
    // the charge equals the plan's number of default trial days
    const fullTrialStarted =
      charge.recurring_application_charge.trial_days === plan.trialDays;

    await prisma.shop.update({
      where: {
        domain: shopDomain,
      },
      data: {
        planChargeId: chargeId,
        planId: plan.id,

        // Set the last trial at date only when starting a full trial
        ...(fullTrialStarted && { lastTrialAt: new Date() }),
      },
    });
  }

  return res.redirect(
    `https://${shopDomain}/admin/apps/${config.NEXT_PUBLIC_SHOPIFY_CLIENT_ID}/dashboard`,
  );
});

export default router.handler({
  onError: errorHandler,
});
