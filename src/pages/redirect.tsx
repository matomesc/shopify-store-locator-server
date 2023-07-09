import { useNavigate } from '@shopify/app-bridge-react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Redirect: NextPage = () => {
  const router = useRouter();
  const navigate = useNavigate();

  useEffect(() => {
    if (router.isReady) {
      const redirectUrl = decodeURIComponent(String(router.query.redirectUrl));
      navigate(redirectUrl);
    }
  }, [navigate, router.isReady, router.query.redirectUrl]);

  return <div />;
};

export default Redirect;
