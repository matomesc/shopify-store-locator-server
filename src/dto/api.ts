/* eslint-disable @typescript-eslint/no-redeclare */
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

/**
 * GET /api/locator
 */

export const GetLocatorInput = z.object({
  id: z.string(),
  language: z.string(),
});

export const GetLocatorOutput = z.object({
  ok: z.boolean(),
  settings: z.object({
    googleMapsApiKey: z.string(),
  }),
  searchFilters: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      position: z.number(),
      enabled: z.boolean(),
      showInList: z.boolean(),
      showInMap: z.boolean(),
    }),
  ),
  customFields: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      position: z.number(),
      enabled: z.boolean(),
      hideLabel: z.boolean(),
      labelPosition: z.enum(['inline', 'top']),
      showInList: z.boolean(),
      showInMap: z.boolean(),
      defaultValue: z.string(),
    }),
  ),
  customActions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['link', 'js']),
      position: z.number(),
      enabled: z.boolean(),
      showInList: z.boolean(),
      showInMap: z.boolean(),
      defaultValue: z.string(),
      openInNewTab: z.boolean(),
    }),
  ),
  locations: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      active: z.boolean(),
      phone: z.string(),
      email: z.string(),
      website: z.string(),
      address1: z.string(),
      address2: z.string(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
      country: z.string(),
      lat: z.number(),
      lng: z.number(),
      searchFilters: z.array(z.object({ id: z.string() })),
      customFieldValues: z.array(
        z.object({
          id: z.string(),
          value: z.string(),
          locationId: z.string(),
          customFieldId: z.string(),
        }),
      ),
      customActionValues: z.array(
        z.object({
          id: z.string(),
          value: z.string(),
          locationId: z.string(),
          customActionId: z.string(),
        }),
      ),
    }),
  ),
});
export type GetLocatorOutput = z.infer<typeof GetLocatorOutput>;
