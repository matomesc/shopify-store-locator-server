import { useNavigate } from '@shopify/app-bridge-react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';

const Redirect: NextPage = () => {
  const router = useRouter();
  const navigate = useNavigate();

  const redirectUrl = decodeURIComponent(String(router.query.redirectUrl));
  navigate(redirectUrl);

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
