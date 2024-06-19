/* eslint-disable @typescript-eslint/no-redeclare */
import type { AppRouter } from '@/server/trpc/routers/_app';
import type { inferRouterOutputs } from '@trpc/server';
import { z } from 'zod';

// type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

/**
 * Shops
 */

export const ShopsUpdateInput = z.object({
  planId: z.optional(z.literal('free')),
  showPlansModal: z.optional(z.boolean()),
});
export type ShopsUpdateInput = z.infer<typeof ShopsUpdateInput>;

/**
 * Billing
 */

export const BillingCreateChargeInput = z.object({
  planId: z.string(),
});
export type BillingCreateChargeInput = z.infer<typeof BillingCreateChargeInput>;

/**
 * Plans
 */

export type Plan = PlansGetAllOutput['plans'][number];
export type PlansGetAllOutput = RouterOutput['plans']['getAll'];
