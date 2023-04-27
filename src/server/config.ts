import { z } from 'zod';

const Config = z.object({
  BASE_URL: z.string(),
  NEXT_PUBLIC_SHOPIFY_CLIENT_ID: z.string(),
  SHOPIFY_CLIENT_SECRET: z.string(),
  SHOPIFY_SCOPE: z.string(),
  SHOPIFY_REDIRECT_URI: z.string(),
  SHOPIFY_API_VERSION: z.string(),
});

export const config = Config.parse(process.env);
