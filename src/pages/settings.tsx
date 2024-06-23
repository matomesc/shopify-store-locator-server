import { SettingsForm } from '@/client/components/settings/SettingsForm';
import { Spinner } from '@/client/components/Spinner';
import { trpc } from '@/lib/trpc';
import { Button, Card, Page } from '@shopify/polaris';
import { NextPage } from 'next';

const Settings: NextPage = () => {
  const shopsGetQuery = trpc.shops.get.useQuery();
  const plansGetAllQuery = trpc.plans.getAll.useQuery();
  const settingsGetQuery = trpc.settings.get.useQuery();

  if (
    shopsGetQuery.isPending ||
    plansGetAllQuery.isPending ||
    settingsGetQuery.isPending
  ) {
    return <Spinner />;
  }

  if (
    shopsGetQuery.isError ||
    plansGetAllQuery.isError ||
    settingsGetQuery.isError
  ) {
    return (
      <Page>
        <Card>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <p>Failed to load data</p>
            <Button
              onClick={async () => {
                await Promise.all([
                  shopsGetQuery.refetch(),
                  plansGetAllQuery.refetch(),
                  settingsGetQuery.refetch(),
                ]);
              }}
            >
              Retry
            </Button>
          </div>
        </Card>
      </Page>
    );
  }

  return (
    <SettingsForm
      shop={shopsGetQuery.data.shop}
      plans={plansGetAllQuery.data.plans}
      defaultFormValues={{
        googleMapsApiKey: settingsGetQuery.data.settings.googleMapsApiKey,
        timezone: settingsGetQuery.data.settings.timezone,
      }}
    />
  );
};

export default Settings;
