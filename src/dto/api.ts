import { z } from 'zod';

/**
 * GET /api/shopify/billing/callback
 */

export const GetShopifyBillingCallbackInput = z.object({
  charge_id: z.coerce.bigint(),
  shopDomain: z.string(),
  planId: z.string(),
});

/**
 * GET /api/shopify/auth/callback
 */
export const GetShopifyAuthCallbackInput = z.object({
  shop: z.string(),
  code: z.string(),
  host: z.string(),
});
