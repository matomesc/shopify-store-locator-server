import { AlphaCard, Page } from '@shopify/polaris';
import { GetServerSideProps, NextPage } from 'next';

const Settings: NextPage = () => {
  return (
    <Page fullWidth>
      <AlphaCard>Settings</AlphaCard>
    </Page>
  );
};

export default Settings;

// Add getServerSideProps so that the useRouter hook is ready
// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
