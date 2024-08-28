import '@shopify/polaris/build/esm/styles.css';
import type { AppProps, AppType } from 'next/app';
import { AppProvider as PolarisAppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { LinkWrapper } from '@/client/components/LinkWrapper';
import { trpc } from '@/lib/trpc';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Script from 'next/script';
import { Tawk } from '@/client/components/Tawk';

const App: AppType = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-JRKJYM4TJP"
        strategy="lazyOnload"
      />
      <Script id="GoogleAnalyticsInit" strategy="lazyOnload">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-JRKJYM4TJP');
      `}</Script>
      <PolarisAppProvider i18n={enTranslations} linkComponent={LinkWrapper}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <ReactQueryDevtools initialIsOpen={false} />
      </PolarisAppProvider>
      <Tawk />
    </>
  );
};

export default trpc.withTRPC(App);
