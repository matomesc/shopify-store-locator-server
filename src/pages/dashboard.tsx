import { GetServerSideProps, NextPage } from 'next';
import {
  Banner,
  Button,
  Card,
  EmptyState,
  Layout,
  Link,
  Page,
} from '@shopify/polaris';
import { prisma } from '@/server/lib/prisma';
import { verifyScopes, verifyShopifyRequest } from '@/server/lib/shopify';
import { config } from '@/server/config';
import { trpc } from '@/lib/trpc';
import { Spinner } from '@/client/components/Spinner';
import { useEffect, useState } from 'react';
import { PlansModal } from '@/client/components/billing/PlansModal';
import * as Sentry from '@sentry/nextjs';
import { useRouter } from 'next/router';
import { LocationsTable } from '@/client/components/locations/LocationsTable';

const Dashboard: NextPage = () => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [state, setState] = useState({
    plansModalOpen: false,
  });
  const shopsGetQuery = trpc.shops.get.useQuery();
  const plansGetAllQuery = trpc.plans.getAll.useQuery();
  const shopsUpdateMutation = trpc.shops.update.useMutation();
  const locationsGetAllQuery = trpc.locations.getAll.useQuery();
  const settingsGetQuery = trpc.settings.get.useQuery();
  useEffect(() => {
    if (shopsGetQuery.isPending || shopsGetQuery.isError) {
      return;
    }

    setState((prevState) => {
      return {
        ...prevState,
        plansModalOpen: shopsGetQuery.data.shop.showPlansModal,
      };
    });
  }, [
    shopsGetQuery.data?.shop.showPlansModal,
    shopsGetQuery.isError,
    shopsGetQuery.isPending,
  ]);

  if (
    shopsGetQuery.isPending ||
    plansGetAllQuery.isPending ||
    locationsGetAllQuery.isPending ||
    settingsGetQuery.isPending
  ) {
    return <Spinner />;
  }

  if (
    shopsGetQuery.isError ||
    plansGetAllQuery.isError ||
    locationsGetAllQuery.isError ||
    settingsGetQuery.isError
  ) {
    return (
      <Page fullWidth>
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
                  locationsGetAllQuery.refetch(),
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
    <Page
      fullWidth
      title="Dashboard"
      primaryAction={
        shopsGetQuery.data.shop.showOnboarding ||
        !settingsGetQuery.data.settings.googleMapsApiKey
          ? undefined
          : {
              content: 'Add location',
              onAction: () => {
                router.push('/locations/create').catch((err) => {
                  Sentry.captureException(err);
                });
              },
            }
      }
      secondaryActions={
        // eslint-disable-next-line no-nested-ternary
        shopsGetQuery.data.shop.showOnboarding ||
        !settingsGetQuery.data.settings.googleMapsApiKey
          ? []
          : locationsGetAllQuery.data.locations.length === 0
            ? [{ content: 'Import' }]
            : [{ content: 'Import' }, { content: 'Export' }]
      }
    >
      <Layout>
        {!shopsGetQuery.data.shop.showOnboarding &&
          !settingsGetQuery.data.settings.googleMapsApiKey && (
            <Layout.Section>
              <Banner title="Setup your Google Maps API key now" tone="warning">
                You have not set a Google Maps API key. Go to{' '}
                <Link url="/setup">setup</Link> to create one.
              </Banner>
            </Layout.Section>
          )}
        {(shopsGetQuery.data.shop.showOnboarding ||
          !settingsGetQuery.data.settings.googleMapsApiKey) && (
          <Layout.Section>
            <Card>
              <EmptyState
                heading="Complete setup to continue"
                action={{
                  content: 'Go to setup',
                  onAction: () => {
                    router.push('/setup').catch((err) => {
                      Sentry.captureException(err);
                    });
                  },
                }}
                image="/checklist.png"
              >
                <p>
                  Once you complete the setup you will be able to import
                  existing data in csv format or manually add your locations
                </p>
              </EmptyState>
            </Card>
          </Layout.Section>
        )}
        {/* Empty state */}
        {settingsGetQuery.data.settings.googleMapsApiKey &&
          !shopsGetQuery.data.shop.showOnboarding &&
          locationsGetAllQuery.data.locations.length === 0 && (
            <Layout.Section>
              <Card>
                <EmptyState
                  heading="Create your first location now"
                  action={{
                    content: 'Add location',
                    onAction: () => {
                      router.push('/locations/create').catch((err) => {
                        Sentry.captureException(err);
                      });
                    },
                  }}
                  secondaryAction={{
                    content: 'Import locations',
                  }}
                  image="/emptystate.png"
                >
                  <p>
                    You can import existing data in csv format or manually add
                    your locations
                  </p>
                </EmptyState>
              </Card>
            </Layout.Section>
          )}
        {/* Locations table */}
        {settingsGetQuery.data.settings.googleMapsApiKey &&
          !shopsGetQuery.data.shop.showOnboarding &&
          locationsGetAllQuery.data.locations.length > 0 && (
            <Layout.Section>
              <Card padding="0">
                <LocationsTable
                  locations={locationsGetAllQuery.data.locations}
                />
              </Card>
            </Layout.Section>
          )}
      </Layout>
      <PlansModal
        open={state.plansModalOpen}
        currentPlanId={shopsGetQuery.data.shop.planId}
        plans={plansGetAllQuery.data.plans}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClose={async () => {
          setState((prevState) => {
            return {
              ...prevState,
              plansModalOpen: false,
            };
          });

          try {
            await shopsUpdateMutation.mutateAsync({
              showPlansModal: false,
            });
            await utils.shops.get.invalidate();
          } catch (err) {
            Sentry.captureException(err);
          }
        }}
      />
    </Page>
  );
};

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (ctx.query.shop) {
    const shopDomain = String(ctx.query.shop);

    const shop = await prisma.shop.findFirst({
      where: {
        domain: shopDomain,
      },
    });

    if (
      !shop ||
      shop.uninstalledAt ||
      !verifyScopes(shop.accessTokenScope, config.SHOPIFY_SCOPE)
    ) {
      const validHmac = verifyShopifyRequest(ctx.query);

      if (!validHmac) {
        throw new Error('Invalid HMAC');
      }

      const redirectUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${
        config.NEXT_PUBLIC_SHOPIFY_CLIENT_ID
      }&scope=${config.SHOPIFY_SCOPE}&redirect_uri=${
        config.SHOPIFY_REDIRECT_URI
      }&state=${Date.now()}`;

      if (ctx.query.embedded === '1') {
        return {
          redirect: {
            destination: `/redirect?redirectUrl=${encodeURIComponent(
              redirectUrl,
            )}`,
            permanent: false,
          },
        };
      }
      return {
        redirect: {
          destination: redirectUrl,
          permanent: false,
        },
      };
    }
  }

  return {
    props: {},
  };
};
