import { z } from 'zod';

const Config = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']),
  NEXT_PUBLIC_SHOPIFY_CLIENT_ID: z.string(),
  NEXT_PUBLIC_SENTRY_DSN: z.string(),
  NEXT_PUBLIC_TAWK_PROPERTY_ID: z.string(),
  NEXT_PUBLIC_TAWK_WIDGET_ID: z.string(),
});

export const config = Config.parse({
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_SHOPIFY_CLIENT_ID: process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_TAWK_PROPERTY_ID: process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID,
  NEXT_PUBLIC_TAWK_WIDGET_ID: process.env.NEXT_PUBLIC_TAWK_WIDGET_ID,
});
