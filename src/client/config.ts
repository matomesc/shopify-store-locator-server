import { z } from 'zod';

const Config = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']),
  NEXT_PUBLIC_SHOPIFY_CLIENT_ID: z.string(),
});

export const config = Config.parse({
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_SHOPIFY_CLIENT_ID: process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID,
});
