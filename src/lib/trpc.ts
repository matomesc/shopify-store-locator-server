import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
// Import ShopifyGlobal interface so window.shopify is defined
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ShopifyGlobal } from '@shopify/app-bridge-react';
import SuperJSON from 'superjson';
import type { AppRouter } from '../server/trpc/routers/_app';

export const trpc = createTRPCNext<AppRouter>({
  config(/* { ctx } */) {
    return {
      links: [
        httpBatchLink({
          transformer: SuperJSON,
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/ssr
           * */
          url: `/api/trpc`,
          methodOverride: 'POST',
          // You can pass any HTTP headers you wish here
          async headers() {
            if (localStorage.getItem('nlm')) {
              const token = localStorage.getItem('nlm');
              return {
                authorization: `Bearer ${token}`,
              };
            }
            if (window.shopify) {
              try {
                const token = await window.shopify.idToken();
                return {
                  authorization: `Bearer ${token}`,
                };
              } catch (err) {
                return {};
              }
            }
            return {};
          },
        }),
      ],
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   * */
  ssr: false,
  transformer: SuperJSON,
});
