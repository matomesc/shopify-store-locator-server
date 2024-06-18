import { z } from 'zod';

/**
 * GET /api/shopify/billing/callback
 */

export const GetShopifyBillingCallbackInput = z.object({
  charge_id: z.coerce.bigint(),
  shopDomain: z.string(),
  planId: z.string(),
});
