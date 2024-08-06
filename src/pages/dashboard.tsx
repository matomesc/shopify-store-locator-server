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
import { LocationsTable } from '@/client/components/dashboard/LocationsTable';
import {
  getCustomActionHeaderName,
  getCustomFieldHeaderName,
  ImportModal,
} from '@/client/components/dashboard/ImportModal';
import { APIProvider } from '@vis.gl/react-google-maps';
import Papa from 'papaparse';

const Dashboard: NextPage = () => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [state, setState] = useState({
    plansModalOpen: false,
    import: {
      /**
       * This key is used to reset the modal. It gets updated on every modal
       * close.
       */
      modalKey: 0,
      modalOpen: false,
    },
  });
  const shopsGetQuery = trpc.shops.get.useQuery();
  const plansGetAllQuery = trpc.plans.getAll.useQuery();
  const shopsUpdateMutation = trpc.shops.update.useMutation();
  const locationsGetAllQuery = trpc.locations.getAll.useQuery();
  const settingsGetQuery = trpc.settings.get.useQuery();
  const searchFiltersGetAllQuery = trpc.searchFilters.getAll.useQuery();
  const customFieldsGetAllQuery = trpc.customFields.getAll.useQuery();
  const customActionsGetAllQuery = trpc.customActions.getAll.useQuery();
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
    settingsGetQuery.isPending ||
    searchFiltersGetAllQuery.isPending ||
    customFieldsGetAllQuery.isPending ||
    customActionsGetAllQuery.isPending
  ) {
    return <Spinner />;
  }

  if (
    shopsGetQuery.isError ||
    plansGetAllQuery.isError ||
    locationsGetAllQuery.isError ||
    settingsGetQuery.isError ||
    searchFiltersGetAllQuery.isError ||
    customFieldsGetAllQuery.isError ||
    customActionsGetAllQuery.isError
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
          : [
              {
                content: 'Import',
                onAction: () => {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      import: {
                        ...prevState.import,
                        modalOpen: true,
                      },
                    };
                  });
                },
              },
              {
                content: 'Export',
                onAction: () => {
                  const searchFilters = [
                    ...searchFiltersGetAllQuery.data.searchFilters,
                  ].sort((searchFilterA, searchFilterB) => {
                    return searchFilterA.position - searchFilterB.position;
                  });
                  const customFields = [
                    ...customFieldsGetAllQuery.data.customFields,
                  ].sort((customFieldA, customFieldB) => {
                    return customFieldA.position - customFieldB.position;
                  });
                  const customActions = [
                    ...customActionsGetAllQuery.data.customActions,
                  ].sort((customActionA, customActionB) => {
                    return customActionA.position - customActionB.position;
                  });

                  const rows = locationsGetAllQuery.data.locations.map(
                    (location) => {
                      const row: Record<string, string> = {
                        Name: location.name,
                        Active: location.active ? 'yes' : 'no',
                        Phone: location.phone,
                        Email: location.email,
                        Website: location.website,
                        Address: location.address1,
                        'Apartment, suite, etc.': location.address2,
                        City: location.city,
                        'State/Province': location.state,
                        'Zip/Postal code': location.zip,
                        Country: location.country,
                        Latitude: String(location.lat),
                        Longitude: String(location.lng),
                        'Search filters': searchFilters
                          .map((searchFilter) => {
                            const included = location.searchFilters.find(
                              (sf) => sf.id === searchFilter.id,
                            );

                            if (included) {
                              return searchFilter.name;
                            }

                            return null;
                          })
                          .filter((v) => !!v)
                          .join(' | '),
                      };

                      customFields.forEach((customField) => {
                        const customFieldValue =
                          location.customFieldValues.find(
                            (cfv) => cfv.customFieldId === customField.id,
                          );

                        if (!customFieldValue || !customFieldValue.value) {
                          row[getCustomFieldHeaderName(customField.name)] =
                            customField.defaultValue;
                        } else {
                          row[getCustomFieldHeaderName(customField.name)] =
                            customFieldValue.value;
                        }
                      });

                      customActions.forEach((customAction) => {
                        const customActionValue =
                          location.customActionValues.find(
                            (cav) => cav.customActionId === customAction.id,
                          );

                        if (!customActionValue || !customActionValue.value) {
                          row[getCustomActionHeaderName(customAction.name)] =
                            customAction.defaultValue;
                        } else {
                          row[getCustomActionHeaderName(customAction.name)] =
                            customActionValue.value;
                        }
                      });

                      return row;
                    },
                  );

                  const csv = Papa.unparse(rows);
                  const url = window.URL.createObjectURL(new Blob([csv]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'export.csv');
                  document.body.appendChild(link);
                  link.click();
                  link.parentNode?.removeChild(link);
                },
              },
            ]
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
                  existing data in CSV format or manually add your locations
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
                    onAction: () => {
                      setState((prevState) => {
                        return {
                          ...prevState,
                          import: {
                            ...prevState.import,
                            modalOpen: true,
                          },
                        };
                      });
                    },
                  }}
                  image="/emptystate.png"
                >
                  <p>
                    You can import existing data in CSV format or manually add
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
      {settingsGetQuery.data.settings.googleMapsApiKey && (
        <APIProvider apiKey={settingsGetQuery.data.settings.googleMapsApiKey}>
          <ImportModal
            key={state.import.modalKey}
            open={state.import.modalOpen}
            searchFilters={searchFiltersGetAllQuery.data.searchFilters}
            customFields={customFieldsGetAllQuery.data.customFields}
            customActions={customActionsGetAllQuery.data.customActions}
            onClose={() => {
              setState((prevState) => {
                return {
                  ...prevState,
                  import: {
                    ...prevState.import,
                    modalOpen: false,
                    modalKey: prevState.import.modalKey + 1,
                  },
                };
              });
            }}
          />
        </APIProvider>
      )}
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
