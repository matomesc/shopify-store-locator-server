/* eslint-disable @typescript-eslint/no-redeclare */
import { z } from 'zod';

export const BillingCreateChargeInput = z.object({
  planId: z.string(),
});
export type BillingCreateChargeInput = z.infer<typeof BillingCreateChargeInput>;
