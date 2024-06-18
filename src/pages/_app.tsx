import '@shopify/polaris/build/esm/styles.css';
import type { AppProps, AppType } from 'next/app';
import { AppProvider as PolarisAppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { LinkWrapper } from '@/client/components/LinkWrapper';
import { NavBar } from '@/client/components/NavBar';
import { trpc } from '@/utils/trpc';

const App: AppType = ({ Component, pageProps }: AppProps) => {
  return (
    <PolarisAppProvider i18n={enTranslations} linkComponent={LinkWrapper}>
      <NavBar />
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Component {...pageProps} />
    </PolarisAppProvider>
  );
};

export default trpc.withTRPC(App);
