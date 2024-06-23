import { NextPage } from 'next';
import { LocationForm } from '@/client/components/locations/LocationForm';
import { Spinner } from '@/client/components/Spinner';
import { trpc } from '@/lib/trpc';
import { Button, Card, Link, Page } from '@shopify/polaris';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export const Edit: NextPage = () => {
  const router = useRouter();
  const [state, setState] = useState<{ id: string | null }>({
    id: null,
  });
  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    setState((prevState) => {
      return {
        ...prevState,
        id: router.query.id ? String(router.query.id) : null,
      };
    });
  }, [router.isReady, router.query.id]);
  const locationsGetByIdQuery = trpc.locations.getById.useQuery(
    {
      id: state.id as string,
    },
    { enabled: !!state.id },
  );

  const settingsGetQuery = trpc.settings.get.useQuery();

  if (settingsGetQuery.isPending || locationsGetByIdQuery.isPending) {
    return <Spinner />;
  }

  if (settingsGetQuery.isError || locationsGetByIdQuery.isError) {
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
                  locationsGetByIdQuery.refetch(),
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
    <APIProvider
      apiKey={settingsGetQuery.data.settings.googleMapsApiKey}
      libraries={['marker']}
    >
      <LocationForm
        mode="edit"
        defaultFormValues={{
          id: locationsGetByIdQuery.data.location.id,
          name: locationsGetByIdQuery.data.location.name,
          active: locationsGetByIdQuery.data.location.active,
          phone: locationsGetByIdQuery.data.location.phone,
          email: locationsGetByIdQuery.data.location.email,
          website: locationsGetByIdQuery.data.location.website,
          address1: locationsGetByIdQuery.data.location.address1,
          address2: locationsGetByIdQuery.data.location.address2,
          city: locationsGetByIdQuery.data.location.city,
          state: locationsGetByIdQuery.data.location.state,
          zip: locationsGetByIdQuery.data.location.zip,
          country: locationsGetByIdQuery.data.location.country,
          lat: locationsGetByIdQuery.data.location.lat,
          lng: locationsGetByIdQuery.data.location.lng,
        }}
      />
    </APIProvider>
  );
};

export default Edit;
