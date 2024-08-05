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

export type GetLocatorOutput = {
  ok: boolean;
  settings: {
    googleMapsApiKey: string;
  };
  searchFilters: Array<{
    id: string;
    name: string;
    position: number;
    enabled: boolean;
    showInList: boolean;
    showInMap: boolean;
  }>;
  customFields: Array<{
    id: string;
    name: string;
    position: number;
    enabled: boolean;
    hideLabel: boolean;
    labelPosition: 'inline' | 'top';
    showInList: boolean;
    showInMap: boolean;
    defaultValue: string;
  }>;
  customActions: Array<{
    id: string;
    name: string;
    type: 'link' | 'js';
    position: number;
    enabled: boolean;
    showInList: boolean;
    showInMap: boolean;
    defaultValue: string;
    openInNewTab: boolean;
  }>;
  locations: Array<{
    id: string;
    name: string;
    active: boolean;
    phone: string;
    email: string;
    website: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    lat: number;
    lng: number;
    searchFilters: Array<{ id: string }>;
    customFieldValues: Array<{
      id: string;
      value: string;
      locationId: string;
      customFieldId: string;
    }>;
    customActionValues: Array<{
      id: string;
      value: string;
      locationId: string;
      customActionId: string;
    }>;
  }>;
};
