/* eslint-disable @typescript-eslint/no-redeclare */
import { countriesByCode } from '@/lib/countries';
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
});
export type SettingsUpdateInput = z.infer<typeof SettingsUpdateInput>;

/**
 * Locations
 */

export type Location = LocationsGetAllOutput['locations'][number];
export type LocationsGetAllOutput = RouterOutput['locations']['getAll'];

export const LocationsCreateInput = z.object({
  id: z.string(),
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
});
export type LocationsUpdateInput = z.infer<typeof LocationsUpdateInput>;
