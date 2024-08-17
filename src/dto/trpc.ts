/* eslint-disable @typescript-eslint/no-redeclare */
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
const HexColor = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Value must be a valid hex color');

const MapMarkerType = z.enum(['pin', 'image']);

export const SettingsUpdateInput = z.object({
  googleMapsApiKey: z.string(),
  timezone: z.string().refine((val) => {
    return timezones.includes(val);
  }, 'Invalid timezone'),
  borderRadius: z
    .string()
    .min(3)
    .max(100)
    .regex(/^\d+(\.\d+)?px$/),
  searchInputBorderColor: HexColor,
  searchInputBackgroundColor: HexColor,
  searchInputPlaceholderColor: HexColor,
  searchButtonTextColor: HexColor,
  searchButtonBackgroundColor: HexColor,
  searchButtonHoverBackgroundColor: HexColor,
  searchFilterTextColor: HexColor,
  searchFilterBackgroundColor: HexColor,
  searchFilterHoverBackgroundColor: HexColor,
  searchFilterSelectedBorderColor: HexColor,
  searchFilterSelectedBackgroundColor: HexColor,
  searchFilterSelectedHoverBackgroundColor: HexColor,
  listLocationNameColor: HexColor,
  listTextColor: HexColor,
  listLinkColor: HexColor,
  listSearchFilterColor: HexColor,
  listCustomActionTextColor: HexColor,
  listCustomActionBackgroundColor: HexColor,
  listCustomActionHoverBackgroundColor: HexColor,
  mapMarkerType: MapMarkerType,
  mapMarkerBackgroundColor: HexColor,
  mapMarkerBorderColor: HexColor,
  mapMarkerGlyphColor: HexColor,
  // You need 4*(n/3) chars to represent n bytes. So for max 5MB we need about
  // 6666667 characters
  mapMarkerImage: z.string().max(6666667),
  mapLocationNameColor: HexColor,
  mapTextColor: HexColor,
  mapLinkColor: HexColor,
  mapSearchFilterColor: HexColor,
  mapCustomActionTextColor: HexColor,
  mapCustomActionBackgroundColor: HexColor,
  mapCustomActionHoverBackgroundColor: HexColor,
});
// We can't use .refine() here because the resulting schema is a ZodEffects
// type which doesn't allow calling .pick() or .omit(). See this issue for
// more details https://github.com/colinhacks/zod/issues/2474.
// .refine((val) => {
//   if (val.mapMarkerType === 'image') {
//     return val.mapMarkerImage.length > 0;
//   }
//   return true;
// })
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
  name: z.string().min(1, 'Name is required').max(100),
  active: z.boolean(),
  phone: z.string().max(100),
  email: z.string().max(100),
  website: z.string().max(300),
  address1: z.string().min(1, 'Address is required').max(200),
  address2: z.string().max(100),
  city: z.string().max(100),
  state: z.string().max(100),
  zip: z.string().max(100),
  country: z.string().max(100),
  lat: z.number(),
  lng: z.number(),
  searchFilters: z.array(z.string().max(100)),
  customFieldValues: z.array(
    z.object({
      id: z.string().max(100),
      customFieldId: z.string(),
      value: z.string().max(300),
    }),
  ),
  customActionValues: z.array(
    z.object({
      id: z.string().max(100),
      customActionId: z.string(),
      value: z.string().max(10000),
    }),
  ),
});
export type LocationsCreateInput = z.infer<typeof LocationsCreateInput>;

export const LocationsUpdateInput = z.object({
  id: z.string().max(100),
  name: z.string().min(1, 'Name is required').max(100),
  active: z.boolean(),
  phone: z.string().max(100),
  email: z.string().max(100),
  website: z.string().max(300),
  address1: z.string().min(1, 'Address is required').max(200),
  address2: z.string().max(100),
  city: z.string().max(100),
  state: z.string().max(100),
  zip: z.string().max(100),
  country: z.string().max(100),
  lat: z.number(),
  lng: z.number(),
  searchFilters: z.array(z.string().max(100)),
  customFieldValues: z.array(
    z.object({
      id: z.string().max(100),
      customFieldId: z.string(),
      value: z.string().max(300),
    }),
  ),
  customActionValues: z.array(
    z.object({
      id: z.string().max(100),
      customActionId: z.string(),
      value: z.string().max(10000),
    }),
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

export const LocationsCreateManyInput = z.array(LocationsCreateInput);
export type LocationsCreateManyInput = z.infer<typeof LocationsCreateManyInput>;

/**
 * Search filters
 */

export type SearchFilter =
  RouterOutput['searchFilters']['getAll']['searchFilters'][number];

export const SearchFiltersSyncInput = z.array(
  z.object({
    id: z.string().max(100),
    name: z
      .string()
      .min(1, 'Search filter name is required')
      .max(100)
      .refine((value) => {
        return !value.includes('|');
      }, "Search filter name can't contain | character"),
    // An integer >= 0
    position: z.number().int().nonnegative(),
    enabled: z.boolean(),
    showInList: z.boolean(),
    showInMap: z.boolean(),
  }),
);
export type SearchFiltersSyncInput = z.infer<typeof SearchFiltersSyncInput>;

/**
 * Custom fields
 */

export type CustomField =
  RouterOutput['customFields']['getAll']['customFields'][number];

export const CustomFieldLabelPosition = z.enum(['inline', 'top']);

export const CustomFieldsSyncInput = z.array(
  z.object({
    id: z.string().max(100),
    name: z
      .string()
      .min(1, 'Custom field name is required')
      .max(100)
      .refine((value) => {
        return !value.includes(':');
      }, "Custom field name can't contain : character"),
    // An integer >= 0
    position: z.number().int().nonnegative(),
    enabled: z.boolean(),
    hideLabel: z.boolean(),
    labelPosition: CustomFieldLabelPosition,
    showInList: z.boolean(),
    showInMap: z.boolean(),
    defaultValue: z.string().max(300),
  }),
);
export type CustomFieldsSyncInput = z.infer<typeof CustomFieldsSyncInput>;

/**
 * Custom actions
 */

export type CustomAction =
  RouterOutput['customActions']['getAll']['customActions'][number];

export const CustomActionType = z.enum(['link', 'js']);
export type CustomActionType = z.infer<typeof CustomActionType>;

export const CustomActionsSyncInput = z.array(
  z.object({
    id: z.string().max(100),
    type: CustomActionType,
    name: z
      .string()
      .min(1, 'Custom action name is required')
      .max(100)
      .refine((value) => {
        return !value.includes(':');
      }, "Custom action name can't contain : character"),
    position: z.number().int().nonnegative(),
    enabled: z.boolean(),
    showInList: z.boolean(),
    showInMap: z.boolean(),
    defaultValue: z.string().max(10000),
    openInNewTab: z.boolean(),
  }),
);
export type CustomActionsSyncInput = z.infer<typeof CustomActionsSyncInput>;

/**
 * Languages
 */

export type Language = RouterOutput['languages']['getAll']['languages'][number];

export const LanguagesSyncInput = z.array(
  z.object({
    id: z.string().max(100),
    code: z.string().max(100),
    enabled: z.boolean(),
    createdAt: z.date(),
  }),
);
export type LanguagesSyncInput = z.infer<typeof LanguagesSyncInput>;

/**
 * Translations
 */

export const TranslationsSyncInput = z.array(
  z
    .object({
      id: z.string().max(100),
      languageId: z.string().max(100),
      value: z.string().max(100),
      target: z.string().max(100).nullable(),
      searchFilterId: z.string().max(100).nullable(),
      customFieldId: z.string().max(100).nullable(),
      customActionId: z.string().max(100).nullable(),
    })
    .refine((value) => {
      const keys = [
        'target',
        'searchFilterId',
        'customFieldId',
        'customActionId',
      ] as const;

      const values = keys.map((key) => value[key]).filter((v) => v !== null);

      return values.length === 1;
    }, 'One of target, searchFilterId, customFieldId or customActionId must be specified'),
);
export type TranslationsSyncInput = z.infer<typeof TranslationsSyncInput>;
