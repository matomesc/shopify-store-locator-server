import { SettingsForm } from '@/client/components/settings/SettingsForm';
import { Spinner } from '@/client/components/Spinner';
import { trpc } from '@/lib/trpc';
import { Button, Card, Page } from '@shopify/polaris';
import { NextPage } from 'next';

const Settings: NextPage = () => {
  const shopsGetQuery = trpc.shops.get.useQuery();
  const plansGetAllQuery = trpc.plans.getAll.useQuery();
  const settingsGetQuery = trpc.settings.get.useQuery();
  const searchFiltersGetAllQuery = trpc.searchFilters.getAll.useQuery();

  if (
    shopsGetQuery.isPending ||
    plansGetAllQuery.isPending ||
    settingsGetQuery.isPending ||
    searchFiltersGetAllQuery.isPending
  ) {
    return <Spinner />;
  }

  if (
    shopsGetQuery.isError ||
    plansGetAllQuery.isError ||
    settingsGetQuery.isError ||
    searchFiltersGetAllQuery.isError
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
                  searchFiltersGetAllQuery.refetch(),
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
        settings: {
          googleMapsApiKey: settingsGetQuery.data.settings.googleMapsApiKey,
          timezone: settingsGetQuery.data.settings.timezone,
        },
        searchFilters: searchFiltersGetAllQuery.data.searchFilters,
      }}
    />
  );
};

export default Settings;
