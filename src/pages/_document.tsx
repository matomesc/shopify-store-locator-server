import { Html, Head, Main, NextScript } from 'next/document';
import { config } from '@/client/config';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="shopify-api-key"
          content={config.NEXT_PUBLIC_SHOPIFY_CLIENT_ID}
        />
        {/* We need to load Shopify app bridge in a regular sync script rather
        then using Next's Script component */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
