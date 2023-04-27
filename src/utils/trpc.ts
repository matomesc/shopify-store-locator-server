import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import createApp from '@shopify/app-bridge';
import { getSessionToken } from '@shopify/app-bridge/utilities';
import type { AppRouter } from '../server/routers/_app';

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      links: [
        httpBatchLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/ssr
           * */
          url: `/api/trpc`,
          // You can pass any HTTP headers you wish here
          async headers() {
            const app = createApp({
              apiKey: String(process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID),
              host: String(localStorage.getItem('shopifyHost')),
            });
            const token = await getSessionToken(app);
            return {
              authorization: `Bearer ${token}`,
            };
          },
        }),
      ],
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   * */
  ssr: false,
});
