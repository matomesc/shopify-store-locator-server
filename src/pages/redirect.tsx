import { useAppBridge } from '@shopify/app-bridge-react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Redirect as AppBridgeRedirect } from '@shopify/app-bridge/actions';

const Redirect: NextPage = () => {
  const router = useRouter();
  const app = useAppBridge();
  // const navigate = useNavigate();

  useEffect(() => {
    if (router.isReady) {
      const redirectUrl = decodeURIComponent(String(router.query.redirectUrl));
      const redirect = AppBridgeRedirect.create(app);
      redirect.dispatch(AppBridgeRedirect.Action.REMOTE, redirectUrl);
      // navigate(redirectUrl);
    }
  }, [app, router.isReady, router.query.redirectUrl]);

  return <div />;
};

export default Redirect;
