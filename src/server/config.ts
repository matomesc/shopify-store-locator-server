import { z } from 'zod';

const Config = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  PORT: z.coerce.number(),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']),
  BASE_URL: z.string(),
  DATABASE_URL: z.string(),
  NEXT_PUBLIC_SHOPIFY_CLIENT_ID: z.string(),
  SHOPIFY_CLIENT_SECRET: z.string(),
  SHOPIFY_SCOPE: z.string(),
  SHOPIFY_REDIRECT_URI: z.string(),
  SHOPIFY_API_VERSION: z.string(),
  NEXT_PUBLIC_SENTRY_DSN: z.string(),
  WIDGET_BASE_URL: z.string(),
  REDIS_URL: z.string(),
});

export const config = Config.parse(process.env);
