/* eslint-disable @typescript-eslint/no-redeclare */
import { countriesByCode } from '@/lib/countries';
import { timezones } from '@/lib/timezones';
import type { AppRouter } from '@/server/trpc/routers/_app';
import type { inferRouterOutputs } from '@trpc/server';
import { z } from 'zod';

// type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

/**
 * Shops
 */

export type Shop = RouterOutput['shops']['get']['shop'];

export const ShopsUpdateInput = z.object({
  planId: z.optional(z.literal('free')),
  showPlansModal: z.optional(z.boolean()),
  showOnboarding: z.optional(z.boolean()),
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

/**
 * Settings
 */

export const SettingsUpdateInput = z.object({
  googleMapsApiKey: z.string(),
  timezone: z.string().refine((val) => {
    return timezones.includes(val) || val === '';
  }, 'Invalid timezone'),
});
export type SettingsUpdateInput = z.infer<typeof SettingsUpdateInput>;

/**
 * Locations
 */

export type Location = LocationsGetAllOutput['locations'][number];
export type LocationsGetAllOutput = RouterOutput['locations']['getAll'];

export const LocationsGetByIdInput = z.object({
  id: z.string(),
});
export type LocationsGetByIdInput = z.infer<typeof LocationsGetByIdInput>;

export const LocationsCreateInput = z.object({
  id: z.string().max(100),
  name: z.string().min(1).max(100),
  active: z.boolean(),
  phone: z.string(),
  email: z.string(),
  website: z.string(),
  address1: z.string().min(1).max(200),
  address2: z.string().max(100),
  city: z.string().max(100),
  state: z.string().max(100),
  zip: z.string().max(100),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Invalid country')
    .refine((val) => {
      return !!countriesByCode[val];
    }, 'Invalid country'),
  lat: z.number(),
  lng: z.number(),
  searchFilters: z.array(z.string()),
  customFieldValues: z.array(
    z.object({ id: z.string(), customFieldId: z.string(), value: z.string() }),
  ),
});
export type LocationsCreateInput = z.infer<typeof LocationsCreateInput>;

export const LocationsUpdateInput = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  active: z.boolean(),
  phone: z.string(),
  email: z.string(),
  website: z.string(),
  address1: z.string().max(200),
  address2: z.string().max(100),
  city: z.string().max(100),
  state: z.string().max(100),
  zip: z.string().max(100),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Invalid country')
    .refine((val) => {
      return !!countriesByCode[val];
    }, 'Invalid country'),
  lat: z.number(),
  lng: z.number(),
  searchFilters: z.array(z.string()),
  customFieldValues: z.array(
    z.object({ id: z.string(), customFieldId: z.string(), value: z.string() }),
  ),
});
export type LocationsUpdateInput = z.infer<typeof LocationsUpdateInput>;

export const LocationsDeleteInput = z.object({
  id: z.string(),
});
export type LocationsDeleteInput = z.infer<typeof LocationsDeleteInput>;

export const LocationsDeleteManyInput = z.object({
  ids: z.array(z.string()),
});
export type LocationsDeleteManyInput = z.infer<typeof LocationsDeleteManyInput>;

/**
 * Search filters
 */

export type SearchFilter =
  RouterOutput['searchFilters']['getAll']['searchFilters'][number];

export const SearchFiltersCreateInput = z.object({
  name: z.string().min(1).max(100),
  // An integer > 0
  position: z.number().int().nonnegative(),
});
export type SearchFiltersCreateInput = z.infer<typeof SearchFiltersCreateInput>;

export const SearchFiltersUpdateInput = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  // An integer >= 0
  position: z.number().int().nonnegative(),
});
export type SearchFiltersUpdateInput = z.infer<typeof SearchFiltersUpdateInput>;

export const SearchFiltersDeleteInput = z.object({
  id: z.string(),
});
export type SearchFiltersDeleteInput = z.infer<typeof SearchFiltersDeleteInput>;

export const SearchFilterSyncInput = z.array(
  z.object({
    id: z.string(),
    name: z.string().min(1).max(100),
    // An integer >= 0
    position: z.number().int().nonnegative(),
  }),
);
export type SearchFilterSyncInput = z.infer<typeof SearchFilterSyncInput>;

/**
 * Custom fields
 */

export type CustomField =
  RouterOutput['customFields']['getAll']['customFields'][number];

export const CustomFieldLabelPosition = z.enum(['inline', 'top']);

export const CustomFieldsSyncInput = z.array(
  z.object({
    id: z.string(),
    name: z
      .string()
      .min(1, { message: 'Custom field name is required' })
      .max(100),
    // An integer >= 0
    position: z.number().int().nonnegative(),
    hideLabel: z.boolean(),
    labelPosition: CustomFieldLabelPosition,
    showInList: z.boolean(),
    showInMap: z.boolean(),
    defaultValue: z.string().max(1000),
  }),
);
export type CustomFieldsSyncInput = z.infer<typeof CustomFieldsSyncInput>;
