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
    borderRadius: string;
    searchInputBorderColor: string;
    searchInputBackgroundColor: string;
    searchInputPlaceholderColor: string;
    searchButtonTextColor: string;
    searchButtonBackgroundColor: string;
    searchButtonHoverBackgroundColor: string;
    searchFilterTextColor: string;
    searchFilterBackgroundColor: string;
    searchFilterHoverBackgroundColor: string;
    searchFilterSelectedBorderColor: string;
    searchFilterSelectedBackgroundColor: string;
    searchFilterSelectedHoverBackgroundColor: string;
    listLocationNameColor: string;
    listTextColor: string;
    listLinkColor: string;
    listSearchFilterColor: string;
    listCustomActionTextColor: string;
    listCustomActionBackgroundColor: string;
    listCustomActionHoverBackgroundColor: string;
    listSelectedLocationBorderColor: string;
    listPinAndDistanceColor: string;
    mapMarkerType: string;
    mapMarkerBackgroundColor: string;
    mapMarkerBorderColor: string;
    mapMarkerGlyphColor: string;
    mapMarkerImage: string;
    mapLocationNameColor: string;
    mapTextColor: string;
    mapLinkColor: string;
    mapSearchFilterColor: string;
    mapCustomActionTextColor: string;
    mapCustomActionBackgroundColor: string;
    mapCustomActionHoverBackgroundColor: string;
  };
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
    searchFilters: string[];
    customFieldValues: Array<{
      id: string;
      value: string;
      customFieldId: string;
    }>;
    customActionValues: Array<{
      id: string;
      value: string;
      customActionId: string;
    }>;
  }>;
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
  translations: Array<{
    id: string;
    value: string;
    target: string | null;
    searchFilterId: string | null;
    customFieldId: string | null;
    customActionId: string | null;
  }>;
};
