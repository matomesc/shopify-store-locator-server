import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Redirect: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady || !router.query.redirectUrl) {
      return;
    }

    const redirectUrl = decodeURIComponent(String(router.query.redirectUrl));

    window.open(redirectUrl, '_top');
  }, [router.isReady, router.query.redirectUrl]);

  return <div />;
};

export default Redirect;
