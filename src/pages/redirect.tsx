import { useAppBridge } from '@shopify/app-bridge-react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { Redirect as AppBridgeRedirect } from '@shopify/app-bridge/actions';

const Redirect: NextPage = () => {
  const router = useRouter();
  const app = useAppBridge();
  // const navigate = useNavigate();

  const redirectUrl = decodeURIComponent(String(router.query.redirectUrl));
  const redirect = AppBridgeRedirect.create(app);
  redirect.dispatch(AppBridgeRedirect.Action.REMOTE, redirectUrl);
  // navigate(redirectUrl);

  return <div />;
};

export default Redirect;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
