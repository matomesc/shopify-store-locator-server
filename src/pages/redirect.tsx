import { useAppBridge } from '@shopify/app-bridge-react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { Redirect as AppBridgeRedirect } from '@shopify/app-bridge/actions';

const Redirect: NextPage = () => {
  const router = useRouter();
  const app = useAppBridge();

  // Currently this hook is broken. It doesn't redirect properly as it
  // duplicates the /store/somestore path. Only seems to be broken for Shopify
  // urls (eg. billing confirmation url).
  // See:
  // https://github.com/Shopify/shopify-app-bridge/issues/214
  // https://github.com/Shopify/shopify-app-bridge/issues/213
  // const navigate = useNavigate();

  const redirectUrl = decodeURIComponent(String(router.query.redirectUrl));
  // navigate(redirectUrl);
  const redirect = AppBridgeRedirect.create(app);
  redirect.dispatch(AppBridgeRedirect.Action.REMOTE, redirectUrl);

  return <div />;
};

export default Redirect;

// Add getServerSideProps so the router is ready on first render
// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
