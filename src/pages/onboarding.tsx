import { Modal } from '@/client/components/Modal';
import { trpc } from '@/lib/trpc';
import {
  Badge,
  Button,
  Card,
  Layout,
  Link,
  Page,
  Text,
  ExceptionList,
  List,
  Collapsible,
  Icon,
} from '@shopify/polaris';
import {
  AlertTriangleIcon,
  ClipboardIcon,
  CodeIcon,
  MenuVerticalIcon,
} from '@shopify/polaris-icons';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Spinner } from '@/client/components/Spinner';
import { Roboto_Mono } from 'next/font/google';
import { toast } from '@/client/lib/toast';
import { config } from '@/client/config';

const robotoMono = Roboto_Mono({
  weight: ['400'],
  subsets: ['latin'],
});

interface ThumbnailProps {
  src: string;
  caption: string;
}

const Thumbnail: React.FC<ThumbnailProps> = ({ src, caption }) => {
  const [state, setState] = useState({
    modalOpen: false,
  });
  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
      jsx-a11y/no-static-element-interactions */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
        }}
        onClick={() => {
          setState((prevState) => {
            return {
              ...prevState,
              modalOpen: true,
            };
          });
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={caption} style={{ width: '200px' }} />
        <div>{caption}</div>
      </div>
      <Modal
        title={caption}
        open={state.modalOpen}
        shouldCloseOnEsc
        onClose={() => {
          setState((prevState) => {
            return {
              ...prevState,
              modalOpen: false,
            };
          });
        }}
        footer={
          <Button
            onClick={() => {
              setState((prevState) => {
                return {
                  ...prevState,
                  modalOpen: false,
                };
              });
            }}
          >
            Close
          </Button>
        }
        height="fit-content"
        maxWidth="1800px"
      >
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={caption} style={{ width: '100%' }} />
        </div>
      </Modal>
    </>
  );
};

interface StepProps {
  index: number;
  name: React.ReactNode;
  description: React.ReactNode;
  images: Array<{ src: string; caption?: string }>;
}

const Step: React.FC<StepProps> = ({ index, name, description, images }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div>
        <Text as="h4" variant="headingXs">
          Step {index} - {name}
        </Text>
      </div>
      <div>{description}</div>
      {images.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {images.map((image, imageIndex) => {
            let caption = `Step ${index}.${imageIndex + 1}`;
            if (image.caption) {
              caption += ` - ${image.caption}`;
            }
            return (
              <Thumbnail key={image.src} src={image.src} caption={caption} />
            );
          })}
        </div>
      )}
    </div>
  );
};

const Onboarding: NextPage = () => {
  const [state, setState] = useState({
    showCreateGoogleMapsApiKey: false,
    showSetupBillingAlerts: false,
    showSetupQuotas: false,
    showShopifyOnlineStore20Theme: false,
    showShopifyVintageTheme: false,
  });
  const shopsUpdateMutation = trpc.shops.update.useMutation();
  const shopsGetQuery = trpc.shops.get.useQuery();
  useEffect(() => {
    shopsUpdateMutation
      .mutateAsync({ showOnboarding: false })
      .catch((err) => Sentry.captureException(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (shopsGetQuery.isPending) {
    return <Spinner />;
  }

  if (shopsGetQuery.isError) {
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
                await Promise.all([shopsGetQuery.refetch()]);
              }}
            >
              Retry
            </Button>
          </div>
        </Card>
      </Page>
    );
  }

  const shopSlug = shopsGetQuery.data.shop.domain.replace('.myshopify.com', '');
  const embedCode = `<script async defer type="text/javascript" src="${document.location.origin}/api/loader?id=${
    shopsGetQuery.data.shop.id
  }"></script><div id="neutek-locator"></div>`;

  return (
    <Page>
      <Card>
        <Layout>
          <Layout.Section>
            <Layout>
              <Layout.Section>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <Text as="h2" variant="headingMd">
                    1. Setup Google Maps
                  </Text>
                  <Text as="p">
                    The first thing that you&apos;ll need to do is setup Google
                    Maps (a Google account is required). Google Maps offers $200
                    free credit each month which is equivalent to 10000-15000
                    visits to your store locator (the exact value depends on how
                    many searches the user performs). While this usage will be
                    fine for a small shop, you might go over this limit if your
                    shop receives more traffic. We have instructions to add
                    Google Maps billing alerts and quotas below.{' '}
                    <Text as="span" fontWeight="bold">
                      If you need help setting up Google Maps please contact{' '}
                      <Link url="/support">support</Link>.
                    </Text>
                  </Text>
                </div>
              </Layout.Section>
              <Layout.Section>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <Text as="h3" variant="headingSm">
                    <Badge tone="critical">Required</Badge> Create Google Maps
                    API key
                  </Text>
                  <div style={{ width: '200px' }}>
                    <Button
                      onClick={() => {
                        setState((prevState) => {
                          return {
                            ...prevState,
                            showCreateGoogleMapsApiKey:
                              !prevState.showCreateGoogleMapsApiKey,
                          };
                        });
                      }}
                    >
                      {state.showCreateGoogleMapsApiKey ? 'Hide' : 'Show'}{' '}
                      instructions
                    </Button>
                  </div>
                  <Collapsible
                    id="createGoogleMapsApiKey"
                    open={state.showCreateGoogleMapsApiKey}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      {(
                        [
                          {
                            name: 'Open and sign in to the Google Cloud Console',
                            description: (
                              <div>
                                Open the{' '}
                                <Link
                                  url="https://console.cloud.google.com/"
                                  target="_blank"
                                >
                                  Google Cloud Console
                                </Link>{' '}
                                and sign in with your Google account.
                              </div>
                            ),
                            images: [],
                          },
                          {
                            name: 'Create a new project',
                            description: (
                              <div>
                                Click on the project dropdown at top and then
                                click on{' '}
                                <Text as="span" fontWeight="bold">
                                  NEW PROJECT
                                </Text>
                                . Give your project a meaningful name (eg. Store
                                locator) and then click{' '}
                                <Text as="span" fontWeight="bold">
                                  CREATE
                                </Text>
                                . Wait for the project to be created then select
                                the project by clicking on{' '}
                                <Text as="span" fontWeight="bold">
                                  SELECT PROJECT
                                </Text>{' '}
                                in the popup (or from the project dropdown at
                                the top).
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/google-maps/create-api-key/create-project.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-api-key/create-project-2.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-api-key/create-project-3.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-api-key/create-project-4.png',
                              },
                            ],
                          },
                          {
                            name: 'Finish setting up your account',
                            description: (
                              <div>
                                Open the{' '}
                                <Link url="https://console.cloud.google.com/google/maps-apis/credentials">
                                  Google Maps Platform Keys & Credentials page
                                </Link>
                                . If you are a new Google Cloud user, you will
                                be asked to finish setting up your account by
                                confirming your account type (Individual or
                                Organization), name, address and billing details
                                - click on{' '}
                                <Text as="span" fontWeight="bold">
                                  START FREE
                                </Text>{' '}
                                once you&apos;ve completed the form.
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/google-maps/create-api-key/keys-and-credentials.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-api-key/keys-and-credentials-2.png',
                              },
                            ],
                          },
                          {
                            name: 'Finish setting up Google Maps Platform',
                            description: (
                              <div>
                                Once you finish setting up your Google Cloud
                                account, you will be presented with a popup
                                asking for more details about your Google Maps
                                integration. Complete the information in the
                                popup using the values in the images below. Once
                                completed click on{' '}
                                <Text as="span" fontWeight="bold">
                                  SUBMIT
                                </Text>
                                .
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/google-maps/create-api-key/google-maps-info.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-api-key/google-maps-info-2.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-api-key/google-maps-info-3.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-api-key/google-maps-info-4.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-api-key/google-maps-info-5.png',
                              },
                            ],
                          },
                          {
                            name: 'Copy API key',
                            description: (
                              <div>
                                Once you finished setting up the Google Maps
                                Platform, you will be presented with a popup
                                with your API key. Copy the key and paste it in
                                your{' '}
                                <Link
                                  url={`https://admin.shopify.com/store/${shopSlug}/apps/${config.NEXT_PUBLIC_SHOPIFY_CLIENT_ID}/settings`}
                                  target="_blank"
                                >
                                  settings page
                                </Link>{' '}
                                and save the settings. Click on{' '}
                                <Text as="span" fontWeight="bold">
                                  GO TO GOOGLE MAPS PLATFORM
                                </Text>
                                . You should now see a popup titled{' '}
                                <Text as="span" fontWeight="bold">
                                  Protect your API key
                                </Text>
                                . Click on{' '}
                                <Text as="span" fontWeight="bold">
                                  MAYBE LATER
                                </Text>{' '}
                                (we will add restrictions in the next step).
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/google-maps/create-api-key/copy-api-key.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-api-key/copy-api-key-2.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-api-key/copy-api-key-3.png',
                              },
                            ],
                          },
                          {
                            name: 'Add API key restrictions',
                            description: (
                              <div>
                                <style jsx>{`
                                  div > :global(span.Polaris-Icon) {
                                    display: inline;
                                    max-width: 20px;
                                    max-height: 20px;
                                    vertical-align: middle;
                                  }
                                  div > :global(span.Polaris-Icon svg) {
                                    display: inline;
                                    max-width: 20px;
                                    max-height: 20px;
                                  }
                                `}</style>
                                Next we&apos;ll add restrictions to the API key
                                so that only your website and Neutek Store
                                Locator & Map can use it. Go to the{' '}
                                <Link url="https://console.cloud.google.com/google/maps-apis/credentials">
                                  Google Maps Platform Keys & Credentials page
                                </Link>
                                , find your key, click on the menu (
                                <Icon source={MenuVerticalIcon} tone="base" />)
                                and click on{' '}
                                <Text as="span" fontWeight="bold">
                                  Edit API key
                                </Text>
                                . Under{' '}
                                <Text as="span" fontWeight="bold">
                                  Set an application restriction
                                </Text>
                                , select{' '}
                                <Text as="span" fontWeight="bold">
                                  Websites
                                </Text>{' '}
                                and click on{' '}
                                <Text as="span" fontWeight="bold">
                                  ADD
                                </Text>
                                . Add the following domains:
                                <br />
                                Your shop&apos;s domain:{' '}
                                <Text as="span" fontWeight="bold">
                                  https://{shopsGetQuery.data.shop.customDomain}
                                </Text>
                                <br />
                                Neutek Store Locator & Map domain:{' '}
                                <Text as="span" fontWeight="bold">
                                  {document.location.origin}
                                </Text>
                                <br />
                                Once you finished, scroll to the bottom and
                                click on{' '}
                                <Text as="span" fontWeight="bold">
                                  SAVE
                                </Text>
                                .
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/google-maps/create-api-key/add-api-key-restrictions.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-api-key/add-api-key-restrictions-2.png',
                              },
                            ],
                          },
                          {
                            name: 'Active your Google Cloud account',
                            description: (
                              <div>
                                Finally, we need to activate your Google Cloud
                                account. Go to the{' '}
                                <Link
                                  url="https://console.cloud.google.com/billing"
                                  target="_blank"
                                >
                                  Google Cloud Billing page
                                </Link>{' '}
                                and click on your billing account. Click on{' '}
                                <Text as="span" fontWeight="bold">
                                  ACTIVATE
                                </Text>{' '}
                                to activate your account. That&apos;s it - your
                                Google Maps API key has been configured and is
                                ready for usage.
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/google-maps/create-api-key/billing-page.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-api-key/billing-activate.png',
                              },
                            ],
                          },
                        ] as Array<{
                          name: React.ReactNode;
                          description: React.ReactNode;
                          images: Array<{ src: string; caption?: string }>;
                        }>
                      ).map((step, index) => {
                        return (
                          <Step
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            index={index + 1}
                            name={step.name}
                            description={step.description}
                            images={step.images}
                          />
                        );
                      })}
                    </div>
                  </Collapsible>
                </div>
              </Layout.Section>
              <Layout.Section>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <Text as="h3" variant="headingSm">
                    <Badge tone="warning">Optional</Badge> Set up billing alerts
                    to track Google Maps usage
                  </Text>
                  <div style={{ width: '200px' }}>
                    <Button
                      onClick={() => {
                        setState((prevState) => {
                          return {
                            ...prevState,
                            showSetupBillingAlerts:
                              !prevState.showSetupBillingAlerts,
                          };
                        });
                      }}
                    >
                      {state.showSetupBillingAlerts ? 'Hide' : 'Show'}{' '}
                      instructions
                    </Button>
                  </div>
                  <Collapsible
                    id="createGoogleMapsAlerts"
                    open={state.showSetupBillingAlerts}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      {(
                        [
                          {
                            name: 'Open Google Cloud billing',
                            description: (
                              <div>
                                Open the{' '}
                                <Link url="https://console.cloud.google.com/billing">
                                  Google Cloud billing page
                                </Link>{' '}
                                and click on the billing account associated with
                                your project. If you followed the steps above to
                                create your Google Maps API key, there should
                                only be one billing account. If there are no
                                billing accounts, you can create one by clicking
                                on{' '}
                                <Text as="span" fontWeight="bold">
                                  CREATE ACCOUNT
                                </Text>{' '}
                                and complete the form.
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/google-maps/create-billing-alerts/billing-page.png',
                              },
                            ],
                          },
                          {
                            name: 'Open Budget & Alerts',
                            description: (
                              <div>
                                Click on{' '}
                                <Text as="span" fontWeight="bold">
                                  Budget & Alerts
                                </Text>{' '}
                                in the sidebar.
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/google-maps/create-billing-alerts/open-budget-alerts.png',
                              },
                            ],
                          },
                          {
                            name: 'Create a new budget',
                            description: (
                              <div>
                                If you followed the steps above to create your
                                Google Maps API key, there should already be a
                                budget alert setup. If you want to edit the
                                existing alert click on it. Otherwise, to create
                                a new budget alert click on{' '}
                                <Text as="span" fontWeight="bold">
                                  CREATE BUDGET
                                </Text>
                                .
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/google-maps/create-billing-alerts/create-budget-alert.png',
                              },
                            ],
                          },
                          {
                            name: 'Configure budget alert scope',
                            description: (
                              <div>
                                After clicking on an existing budget or creating
                                a new one you will be able to configure it. Give
                                it a meaningful name (eg. Store locator),
                                configure the{' '}
                                <Text as="span" fontWeight="bold">
                                  Time range
                                </Text>{' '}
                                (we recommend monthly), make sure that the
                                project you created is selected and that both
                                the{' '}
                                <Text as="span" fontWeight="bold">
                                  Discounts
                                </Text>{' '}
                                and{' '}
                                <Text as="span" fontWeight="bold">
                                  Promotions and others
                                </Text>{' '}
                                checkboxes are selected. Click on{' '}
                                <Text as="span" fontWeight="bold">
                                  NEXT
                                </Text>{' '}
                                to proceed to the next step.
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/google-maps/create-billing-alerts/configure-budget-alert-scope.png',
                              },
                            ],
                          },
                          {
                            name: 'Configure budget alert amount',
                            description: (
                              <div>
                                Choose a total amount for the budget. If you
                                would like to track the free Google Maps credit
                                enter $200. Enter your value in the{' '}
                                <Text as="span" fontWeight="bold">
                                  Target amount
                                </Text>{' '}
                                input. Click on{' '}
                                <Text as="span" fontWeight="bold">
                                  NEXT
                                </Text>{' '}
                                to proceed to the next step.
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/google-maps/create-billing-alerts/configure-budget-alert-amount.png',
                              },
                            ],
                          },
                          {
                            name: 'Configure budget alert thresholds',
                            description: (
                              <div>
                                Optionally configure the budget alert
                                thresholds. These thresholds determine when the
                                alert is sent. By default they trigger at 50%,
                                90% and 100%. Once your done click on{' '}
                                <Text as="span" fontWeight="bold">
                                  FINISH
                                </Text>{' '}
                                to save the budget alert. That&apos;s it -
                                budget alerts have been added and you will be
                                notified when the thresholds are exceeded.
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/google-maps/create-billing-alerts/configure-budget-alert-thresholds.png',
                              },
                            ],
                          },
                        ] as Array<{
                          name: React.ReactNode;
                          description: React.ReactNode;
                          images: Array<{ src: string; caption?: string }>;
                        }>
                      ).map((step, index) => {
                        return (
                          <Step
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            index={index + 1}
                            name={step.name}
                            description={step.description}
                            images={step.images}
                          />
                        );
                      })}
                    </div>
                  </Collapsible>
                </div>
              </Layout.Section>
              <Layout.Section>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <Text as="h3" variant="headingSm">
                    <Badge tone="warning">Optional</Badge> Set up quotas to
                    limit Google Maps usage
                  </Text>
                  <div style={{ width: '200px' }}>
                    <Button
                      onClick={() => {
                        setState((prevState) => {
                          return {
                            ...prevState,
                            showSetupQuotas: !prevState.showSetupQuotas,
                          };
                        });
                      }}
                    >
                      {state.showSetupQuotas ? 'Hide' : 'Show'} instructions
                    </Button>
                  </div>
                  <Collapsible
                    id="createGoogleMapsQuotas"
                    open={state.showSetupQuotas}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <Text as="p">
                        The locator uses three Google Maps APIs:
                      </Text>
                      <List type="bullet">
                        <List.Item>
                          Maps JavaScript API: One map load is used each time
                          someone visits the page with your store locator (
                          <Link
                            target="_blank"
                            url="https://developers.google.com/maps/documentation/javascript/usage-and-billing"
                          >
                            Google pricing page for the Maps JavsScript API
                          </Link>
                          )
                        </List.Item>
                        <List.Item>
                          Geocoding API: One request is used each time someone
                          types a search and clicks the search button (or
                          presses the Enter key). (
                          <Link
                            target="_blank"
                            url="https://developers.google.com/maps/documentation/geocoding/usage-and-billing#pricing-for-product"
                          >
                            Google pricing page for the Geocoding API
                          </Link>
                          )
                        </List.Item>
                        <List.Item>
                          Places API: One request is used each time a visitor
                          types a letter in the search box (eg. typing
                          &quot;N&quot;, &quot;Y&quot;, &quot;C&quot; to spell
                          &quot;NYC&quot; would use 3 requests). (
                          <Link
                            target="_blank"
                            url="https://developers.google.com/maps/documentation/places/web-service/usage-and-billing"
                          >
                            Google pricing page for the Places API
                          </Link>
                          )
                        </List.Item>
                      </List>
                      <ExceptionList
                        items={[
                          {
                            icon: AlertTriangleIcon,
                            status: 'critical',
                            description: (
                              <Text as="span" tone="critical">
                                We don&apos;t recommend setting quotas first if
                                you&apos;re planning on bulk importing your
                                locations. It&apos;s prefereable to do the bulk
                                import first and then add quotas.
                              </Text>
                            ),
                          },
                        ]}
                      />
                      {(
                        [
                          {
                            name: 'Open the Google Maps Quotas page',
                            description: (
                              <div>
                                Open the{' '}
                                <Link
                                  url="https://console.cloud.google.com/google/maps-apis/quotas"
                                  target="_blank"
                                >
                                  Google Maps Quotas page
                                </Link>
                                .
                              </div>
                            ),
                            images: [],
                          },
                          {
                            name: 'Add Maps JavaScript API quota',
                            description: (
                              <div>
                                <style jsx>{`
                                  div > :global(span.Polaris-Icon) {
                                    display: inline;
                                    max-width: 20px;
                                    max-height: 20px;
                                    vertical-align: middle;
                                  }
                                  div > :global(span.Polaris-Icon svg) {
                                    display: inline;
                                    max-width: 20px;
                                    max-height: 20px;
                                  }
                                `}</style>
                                Click on dropdown at the top and select{' '}
                                <Text as="span" fontWeight="bold">
                                  Maps Javascript API
                                </Text>
                                . In the table, look for{' '}
                                <Text as="span" fontWeight="bold">
                                  Map loads per day
                                </Text>
                                . Click on the menu (
                                <Icon source={MenuVerticalIcon} tone="base" />)
                                and then click on{' '}
                                <Text as="span" fontWeight="bold">
                                  Edit quota
                                </Text>
                                . Uncheck the{' '}
                                <Text as="span" fontWeight="bold">
                                  Unlimited
                                </Text>{' '}
                                checkbox and enter a value. We recommend at
                                least 350 for low traffic shop. Click on{' '}
                                <Text as="span" fontWeight="bold">
                                  SUBMIT REQUEST
                                </Text>{' '}
                                to save the quota.
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/google-maps/create-quotas/quotas-select-api.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-quotas/quotas-maps-javascript-api-select.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-quotas/quotas-maps-javascript-api-edit-quota.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-quotas/quotas-maps-javascript-api-edit-quota-options.png',
                              },
                            ],
                          },
                          {
                            name: 'Add Geocoding API quota',
                            description: (
                              <div>
                                <style jsx>{`
                                  div > :global(span.Polaris-Icon) {
                                    display: inline;
                                    max-width: 20px;
                                    max-height: 20px;
                                    vertical-align: middle;
                                  }
                                  div > :global(span.Polaris-Icon svg) {
                                    display: inline;
                                    max-width: 20px;
                                    max-height: 20px;
                                  }
                                `}</style>
                                Click on dropdown at the top and select{' '}
                                <Text as="span" fontWeight="bold">
                                  Geocoding API
                                </Text>
                                . In the table, look for{' '}
                                <Text as="span" fontWeight="bold">
                                  Requests per day
                                </Text>
                                . Click on the menu (
                                <Icon source={MenuVerticalIcon} tone="base" />)
                                and then click on{' '}
                                <Text as="span" fontWeight="bold">
                                  Edit quota
                                </Text>
                                . Uncheck the{' '}
                                <Text as="span" fontWeight="bold">
                                  Unlimited
                                </Text>{' '}
                                checkbox and enter a value. We recommend at
                                least 350 for low traffic shop. Click on{' '}
                                <Text as="span" fontWeight="bold">
                                  SUBMIT REQUEST
                                </Text>{' '}
                                to save the quota.
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/google-maps/create-quotas/quotas-select-api.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-quotas/quotas-geocoding-api-select.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-quotas/quotas-geocoding-api-edit-quota.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-quotas/quotas-geocoding-api-edit-quota-options.png',
                              },
                            ],
                          },
                          {
                            name: 'Add Places API quota',
                            description: (
                              <div>
                                <style jsx>{`
                                  div > :global(span.Polaris-Icon) {
                                    display: inline;
                                    max-width: 20px;
                                    max-height: 20px;
                                    vertical-align: middle;
                                  }
                                  div > :global(span.Polaris-Icon svg) {
                                    display: inline;
                                    max-width: 20px;
                                    max-height: 20px;
                                  }
                                `}</style>
                                Click on dropdown at the top and select{' '}
                                <Text as="span" fontWeight="bold">
                                  Places API
                                </Text>
                                . In the table, look for{' '}
                                <Text as="span" fontWeight="bold">
                                  Requests per day
                                </Text>
                                . Click on the menu (
                                <Icon source={MenuVerticalIcon} tone="base" />)
                                and then click on{' '}
                                <Text as="span" fontWeight="bold">
                                  Edit quota
                                </Text>
                                . Uncheck the{' '}
                                <Text as="span" fontWeight="bold">
                                  Unlimited
                                </Text>{' '}
                                checkbox and enter a value. We recommend at
                                least 150 for low traffic shop. Click on{' '}
                                <Text as="span" fontWeight="bold">
                                  SUBMIT REQUEST
                                </Text>{' '}
                                to save the quota.
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/google-maps/create-quotas/quotas-select-api.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-quotas/quotas-places-api-select.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-quotas/quotas-places-api-edit-quota.png',
                              },
                              {
                                src: '/img/onboarding/google-maps/create-quotas/quotas-places-api-edit-quota-options.png',
                              },
                            ],
                          },
                        ] as Array<{
                          name: React.ReactNode;
                          description: React.ReactNode;
                          images: Array<{ src: string; caption?: string }>;
                        }>
                      ).map((step, index) => {
                        return (
                          <Step
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            index={index + 1}
                            name={step.name}
                            description={step.description}
                            images={step.images}
                          />
                        );
                      })}
                    </div>
                  </Collapsible>
                </div>
              </Layout.Section>
            </Layout>
          </Layout.Section>
          <Layout.Section>
            <Layout>
              <Layout.Section>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <Text as="h2" variant="headingMd">
                    2. Setup Shopify
                  </Text>
                  <Text as="p">
                    The next thing you need to do is setup your Shopify store by
                    adding your embed code. The process is different depending
                    if you have an Online Store 2.0 theme or an Online Store 1.0
                    (aka vintage) theme. You can check if you have an Online
                    Store 2.0 or vintage theme by following the instructions{' '}
                    <Link
                      url="https://help.shopify.com/en/manual/online-store/themes/managing-themes/versions"
                      target="_blank"
                    >
                      here
                    </Link>
                    .{' '}
                    <Text as="span" fontWeight="bold">
                      If you need help setting up Shopify please contact{' '}
                      <Link url="/support">support</Link>.
                    </Text>
                    .
                  </Text>
                  <Text as="p">Your embed code is:</Text>
                  <div
                    style={{
                      padding: '12px',
                      background: 'rgba(243, 243, 243, 1)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div className={robotoMono.className}>{embedCode}</div>
                    <div>
                      <Button
                        icon={ClipboardIcon}
                        onClick={() => {
                          navigator.clipboard
                            .writeText(embedCode)
                            .then(() => {
                              toast('success', 'Copied to clipboard');
                            })
                            .catch((err) => {
                              toast('error', 'Failed to copy');
                              Sentry.captureException(err);
                            });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
              </Layout.Section>
              <Layout.Section>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <Text as="h3" variant="headingSm">
                    Setup Online Store 2.0 theme
                  </Text>
                  <div style={{ width: '200px' }}>
                    <Button
                      onClick={() => {
                        setState((prevState) => {
                          return {
                            ...prevState,
                            showShopifyOnlineStore20Theme:
                              !prevState.showShopifyOnlineStore20Theme,
                          };
                        });
                      }}
                    >
                      {state.showShopifyOnlineStore20Theme ? 'Hide' : 'Show'}{' '}
                      instructions
                    </Button>
                  </div>
                  <Collapsible
                    id="shopifyOnlineStore20Theme"
                    open={state.showShopifyOnlineStore20Theme}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      {(
                        [
                          {
                            name: 'Copy your embed code',
                            description: (
                              <div>
                                Copy your embed code from above by clicking the{' '}
                                <Text as="span" fontWeight="bold">
                                  Copy
                                </Text>{' '}
                                button.
                              </div>
                            ),
                            images: [],
                          },
                          {
                            name: 'Open the theme editor',
                            description: (
                              <div>
                                Open the{' '}
                                <Link
                                  url={`https://admin.shopify.com/store/${shopSlug}/themes`}
                                  target="_blank"
                                >
                                  theme section of your online store
                                </Link>{' '}
                                and click{' '}
                                <Text as="span" fontWeight="bold">
                                  Customize
                                </Text>{' '}
                                to open the theme editor.
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/shopify/online-store-2-theme/theme-section.png',
                              },
                            ],
                          },
                          {
                            name: 'Create a new template (or select existing one)',
                            description: (
                              <div>
                                Click the dropdown at the top of the theme
                                editor and select{' '}
                                <Text as="span" fontWeight="bold">
                                  Pages
                                </Text>
                                . Then either select an existing template or
                                click{' '}
                                <Text as="span" fontWeight="bold">
                                  Create template
                                </Text>{' '}
                                to create a new template. If you&apos;re
                                creating a new template, give it a meaningful
                                name (eg. Store locator) and make sure it&apos;s
                                based on the{' '}
                                <Text as="span" fontWeight="bold">
                                  Default page
                                </Text>
                                .
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/shopify/online-store-2-theme/theme-editor-dropdown.png',
                              },
                              {
                                src: '/img/onboarding/shopify/online-store-2-theme/theme-editor-create-template.png',
                              },
                              {
                                src: '/img/onboarding/shopify/online-store-2-theme/theme-editor-create-template-options.png',
                              },
                            ],
                          },
                          {
                            name: 'Add embed code',
                            description: (
                              <div>
                                Once the new template is created, click on{' '}
                                <Text as="span" fontWeight="bold">
                                  Add section
                                </Text>{' '}
                                in the{' '}
                                <Text as="span" fontWeight="bold">
                                  Template
                                </Text>{' '}
                                section, then scroll down and click on{' '}
                                <Text as="span" fontWeight="bold">
                                  Custom Liquid
                                </Text>
                                . Once the custom liquid section is added to the
                                page, you can paste the embed code you copied
                                earlier in the{' '}
                                <Text as="span" fontWeight="bold">
                                  Liquid code
                                </Text>{' '}
                                textbox and save your changes by clicking{' '}
                                <Text as="span" fontWeight="bold">
                                  Save
                                </Text>
                                .
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/shopify/online-store-2-theme/theme-editor-add-custom-liquid-section.png',
                              },
                              {
                                src: '/img/onboarding/shopify/online-store-2-theme/theme-editor-add-liquid-code.png',
                              },
                            ],
                          },
                          {
                            name: 'Add a new page that uses the template',
                            description: (
                              <div>
                                Open the{' '}
                                <Link
                                  url={`https://admin.shopify.com/store/${shopSlug}/themes`}
                                  target="_blank"
                                >
                                  pages section of your online store
                                </Link>{' '}
                                and click on{' '}
                                <Text as="span" fontWeight="bold">
                                  Add page
                                </Text>
                                . Give the new page a meaningful title (eg.
                                Store locator) and select the template you just
                                created from the{' '}
                                <Text as="span" fontWeight="bold">
                                  Theme template
                                </Text>{' '}
                                dropdown. Once finished, click on{' '}
                                <Text as="span" fontWeight="bold">
                                  Save
                                </Text>
                                .
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/shopify/online-store-2-theme/pages-section.png',
                              },
                              {
                                src: '/img/onboarding/shopify/online-store-2-theme/pages-section-add-page.png',
                              },
                            ],
                          },
                          {
                            name: 'Add the store locator to your navigation menu',
                            description: (
                              <div>
                                Lastly, you should add the store locator to your
                                navigation menu so users can find it. Open the{' '}
                                <Link
                                  url={`https://admin.shopify.com/store/${shopSlug}/menus`}
                                  target="_blank"
                                >
                                  navigation section of your online store
                                </Link>{' '}
                                and click on{' '}
                                <Text as="span" fontWeight="bold">
                                  Main menu
                                </Text>{' '}
                                (or whichever menu you would like to update).
                                Click on{' '}
                                <Text as="span" fontWeight="bold">
                                  Add menu item
                                </Text>{' '}
                                and give the menu item a meaningful name (eg.
                                Store locator). Click on the search box, then
                                select{' '}
                                <Text as="span" fontWeight="bold">
                                  Pages
                                </Text>{' '}
                                and click on the page you created above. Click
                                on{' '}
                                <Text as="span" fontWeight="bold">
                                  Add
                                </Text>{' '}
                                then{' '}
                                <Text as="span" fontWeight="bold">
                                  Save menu
                                </Text>
                                . That&apos;s it - the store locator has been
                                installed and can be found on your navigation
                                menu.
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/shopify/online-store-2-theme/navigation-section.png',
                              },
                              {
                                src: '/img/onboarding/shopify/online-store-2-theme/navigation-section-add-menu-item.png',
                              },
                            ],
                          },
                        ] as Array<{
                          name: React.ReactNode;
                          description: React.ReactNode;
                          images: Array<{ src: string; caption?: string }>;
                        }>
                      ).map((step, index) => {
                        return (
                          <Step
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            index={index + 1}
                            name={step.name}
                            description={step.description}
                            images={step.images}
                          />
                        );
                      })}
                    </div>
                  </Collapsible>
                </div>
              </Layout.Section>
              <Layout.Section>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <Text as="h3" variant="headingSm">
                    Setup vintage theme
                  </Text>
                  <div style={{ width: '200px' }}>
                    <Button
                      onClick={() => {
                        setState((prevState) => {
                          return {
                            ...prevState,
                            showShopifyVintageTheme:
                              !prevState.showShopifyVintageTheme,
                          };
                        });
                      }}
                    >
                      {state.showShopifyVintageTheme ? 'Hide' : 'Show'}{' '}
                      instructions
                    </Button>
                  </div>
                  <Collapsible
                    id="shopifyVintageTheme"
                    open={state.showShopifyVintageTheme}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      {(
                        [
                          {
                            name: 'Copy your embed code',
                            description: (
                              <div>
                                Copy your embed code from above by clicking the{' '}
                                <Text as="span" fontWeight="bold">
                                  Copy
                                </Text>{' '}
                                button.
                              </div>
                            ),
                            images: [],
                          },
                          {
                            name: 'Open the pages section',
                            description: (
                              <div>
                                Open the{' '}
                                <Link
                                  url={`https://admin.shopify.com/store/${shopSlug}/pages`}
                                  target="_blank"
                                >
                                  pages section of your online store.
                                </Link>
                              </div>
                            ),
                            images: [],
                          },
                          {
                            name: 'Add a new page with your embed code',
                            description: (
                              <div>
                                <style jsx>{`
                                  div > :global(span.Polaris-Icon) {
                                    display: inline;
                                    max-width: 20px;
                                    max-height: 20px;
                                    vertical-align: middle;
                                  }
                                  div > :global(span.Polaris-Icon svg) {
                                    display: inline;
                                    max-width: 20px;
                                    max-height: 20px;
                                  }
                                `}</style>
                                Click the{' '}
                                <Text as="span" fontWeight="bold">
                                  Add page
                                </Text>{' '}
                                button to create a new page. Give your page a
                                meaningful title and click the{' '}
                                <Text as="span" fontWeight="bold">
                                  code button
                                </Text>{' '}
                                (
                                <Icon source={CodeIcon} tone="base" />
                                ). Paste your embed code in the{' '}
                                <Text as="span" fontWeight="bold">
                                  Content
                                </Text>{' '}
                                textbox and click{' '}
                                <Text as="span" fontWeight="bold">
                                  Save
                                </Text>{' '}
                                to save the page.
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/shopify/vintage-theme/pages-section-add-page.png',
                              },
                              {
                                src: '/img/onboarding/shopify/vintage-theme/pages-section-add-page-2.png',
                              },
                              {
                                src: '/img/onboarding/shopify/vintage-theme/pages-section-add-page-3.png',
                              },
                            ],
                          },
                          {
                            name: 'Add the store locator to your navigation menu',
                            description: (
                              <div>
                                Lastly, you should add the store locator to your
                                navigation menu so users can find it. Open the{' '}
                                <Link
                                  url={`https://admin.shopify.com/store/${shopSlug}/menus`}
                                  target="_blank"
                                >
                                  navigation section of your online store
                                </Link>{' '}
                                and click on{' '}
                                <Text as="span" fontWeight="bold">
                                  Main menu
                                </Text>{' '}
                                (or whichever menu you would like to update).
                                Click on{' '}
                                <Text as="span" fontWeight="bold">
                                  Add menu item
                                </Text>{' '}
                                and give the menu item a meaningful name (eg.
                                Store locator). Click on the search box, then
                                select{' '}
                                <Text as="span" fontWeight="bold">
                                  Pages
                                </Text>{' '}
                                and click on the page you created above. Click
                                on{' '}
                                <Text as="span" fontWeight="bold">
                                  Add
                                </Text>{' '}
                                then{' '}
                                <Text as="span" fontWeight="bold">
                                  Save menu
                                </Text>
                                . That&apos;s it - the store locator has been
                                installed and can be found on your navigation
                                menu.
                              </div>
                            ),
                            images: [
                              {
                                src: '/img/onboarding/shopify/vintage-theme/navigation-section.png',
                              },
                              {
                                src: '/img/onboarding/shopify/vintage-theme/navigation-section-add-menu-item.png',
                              },
                            ],
                          },
                        ] as Array<{
                          name: React.ReactNode;
                          description: React.ReactNode;
                          images: Array<{ src: string; caption?: string }>;
                        }>
                      ).map((step, index) => {
                        return (
                          <Step
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            index={index + 1}
                            name={step.name}
                            description={step.description}
                            images={step.images}
                          />
                        );
                      })}
                    </div>
                  </Collapsible>
                </div>
              </Layout.Section>
            </Layout>
          </Layout.Section>
        </Layout>
      </Card>
    </Page>
  );
};

export default Onboarding;
