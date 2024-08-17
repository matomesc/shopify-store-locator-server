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
  const customFieldsGetAllQuery = trpc.customFields.getAll.useQuery();
  const customActionsGetAllQuery = trpc.customActions.getAll.useQuery();
  const languagesGetAllQuery = trpc.languages.getAll.useQuery();
  const translationsGetAllQuery = trpc.translations.getAll.useQuery();

  if (
    shopsGetQuery.isPending ||
    plansGetAllQuery.isPending ||
    settingsGetQuery.isPending ||
    searchFiltersGetAllQuery.isPending ||
    customFieldsGetAllQuery.isPending ||
    customActionsGetAllQuery.isPending ||
    languagesGetAllQuery.isPending ||
    translationsGetAllQuery.isPending
  ) {
    return <Spinner />;
  }

  if (
    shopsGetQuery.isError ||
    plansGetAllQuery.isError ||
    settingsGetQuery.isError ||
    searchFiltersGetAllQuery.isError ||
    customFieldsGetAllQuery.isError ||
    customActionsGetAllQuery.isError ||
    languagesGetAllQuery.isError ||
    translationsGetAllQuery.isError
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
                  customFieldsGetAllQuery.refetch(),
                  customActionsGetAllQuery.refetch(),
                  languagesGetAllQuery.refetch(),
                  translationsGetAllQuery.refetch(),
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
        settings: settingsGetQuery.data.settings,
        searchFilters: searchFiltersGetAllQuery.data.searchFilters,
        customFields: customFieldsGetAllQuery.data.customFields,
        customActions: customActionsGetAllQuery.data.customActions,
        languages: languagesGetAllQuery.data.languages,
        translations: translationsGetAllQuery.data.translations,
      }}
    />
  );
};

export default Settings;
