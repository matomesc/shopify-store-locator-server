import { LocationForm } from '@/client/components/locations/LocationForm';
import { Spinner } from '@/client/components/Spinner';
import { trpc } from '@/lib/trpc';
import { Button, Card, Link, Page } from '@shopify/polaris';
import { APIProvider } from '@vis.gl/react-google-maps';
import { NextPage } from 'next';
import Head from 'next/head';
import { v4 } from 'uuid';

const LocationsCreate: NextPage = () => {
  const settingsGetQuery = trpc.settings.get.useQuery();
  const searchFiltersGetAllQuery = trpc.searchFilters.getAll.useQuery();
  const customFieldsGetAllQuery = trpc.customFields.getAll.useQuery();
  const customActionsGetAllQuery = trpc.customActions.getAll.useQuery();

  if (
    settingsGetQuery.isPending ||
    searchFiltersGetAllQuery.isPending ||
    customFieldsGetAllQuery.isPending ||
    customActionsGetAllQuery.isPending
  ) {
    return <Spinner />;
  }

  if (
    settingsGetQuery.isError ||
    searchFiltersGetAllQuery.isError ||
    customFieldsGetAllQuery.isError ||
    customActionsGetAllQuery.isError
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
                  settingsGetQuery.refetch(),
                  searchFiltersGetAllQuery.refetch(),
                  customFieldsGetAllQuery.refetch(),
                  customActionsGetAllQuery.refetch(),
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

  if (!settingsGetQuery.data.settings.googleMapsApiKey) {
    return (
      <Page>
        <Card>
          <p>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            Missing Google Maps API key. Go to <Link url="/setup">
              setup
            </Link>{' '}
            to create one.
          </p>
        </Card>
      </Page>
    );
  }

  return (
    <>
      <Head>
        <title>Create Location</title>
      </Head>
      <APIProvider
        apiKey={settingsGetQuery.data.settings.googleMapsApiKey}
        libraries={['marker']}
      >
        <LocationForm
          mode="create"
          defaultFormValues={{
            id: v4(),
            name: '',
            active: true,
            phone: '',
            email: '',
            website: '',
            address1: '',
            address2: '',
            city: '',
            state: '',
            zip: '',
            country: '',
            lat: 39,
            lng: 34,
            searchFilters: [],
            customFieldValues: customFieldsGetAllQuery.data.customFields.map(
              (customField) => {
                return {
                  id: v4(),
                  customFieldId: customField.id,
                  value: '',
                };
              },
            ),
            customActionValues: customActionsGetAllQuery.data.customActions.map(
              (customAction) => {
                return {
                  id: v4(),
                  customActionId: customAction.id,
                  value: '',
                };
              },
            ),
          }}
          searchFilters={searchFiltersGetAllQuery.data.searchFilters}
          customFields={customFieldsGetAllQuery.data.customFields}
          customActions={customActionsGetAllQuery.data.customActions}
        />
      </APIProvider>
    </>
  );
};

export default LocationsCreate;
