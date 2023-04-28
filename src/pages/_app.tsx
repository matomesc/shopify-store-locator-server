import '@shopify/polaris/build/esm/styles.css';
import type { AppProps, AppType } from 'next/app';
import { useRouter } from 'next/router';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import { Frame, AppProvider as PolarisAppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { LinkWrapper } from '@/client/components/LinkWrapper';
import { NavBar } from '@/client/components/NavBar';
import 'reflect-metadata';
import { trpc } from '@/utils/trpc';

const App: AppType = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  if (router.pathname === '/') {
    // Don't use AppBridgeProvider when rendering the homepage
    return (
      <PolarisAppProvider i18n={enTranslations} linkComponent={LinkWrapper}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
      </PolarisAppProvider>
    );
  }

  if (typeof window !== 'undefined') {
    // Store the shopify host param value so that it can be picked up by trpc
    // see src/utils/trpc.ts
    localStorage.setItem('shopifyHost', String(router.query.host));
  }

  return (
    <AppBridgeProvider
      config={{
        apiKey: String(process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID),
        host:
          typeof window !== 'undefined'
            ? String(localStorage.getItem('shopifyHost'))
            : '',
        forceRedirect: true,
      }}
      router={{
        history: {
          replace: (path) => {
            router.push(path).catch((err) => {
              console.log(err);
            });
          },
        },
        location: router.asPath,
      }}
    >
      <PolarisAppProvider i18n={enTranslations} linkComponent={LinkWrapper}>
        <Frame>
          <NavBar />
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Component {...pageProps} />
        </Frame>
      </PolarisAppProvider>
    </AppBridgeProvider>
  );
};

export default trpc.withTRPC(App);
