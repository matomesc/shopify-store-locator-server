import { useNavigate } from '@shopify/app-bridge-react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

const Redirect: NextPage = () => {
  const router = useRouter();
  const navigate = useNavigate();

  const redirectUrl = decodeURIComponent(String(router.query.redirectUrl));
  navigate(redirectUrl);

  return <div />;
};

export default Redirect;
