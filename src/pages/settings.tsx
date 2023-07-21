import { Card, Page } from '@shopify/polaris';
import { GetServerSideProps, NextPage } from 'next';

const Settings: NextPage = () => {
  return (
    <Page fullWidth>
      <Card>Settings</Card>
    </Page>
  );
};

export default Settings;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
