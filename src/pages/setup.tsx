import { Modal } from '@/client/components/Modal';
import { trpc } from '@/lib/trpc';
import {
  Badge,
  Button,
  Card,
  Collapsible,
  Layout,
  Link,
  Page,
  Text,
  ExceptionList,
  List,
} from '@shopify/polaris';
import { AlertTriangleIcon } from '@shopify/polaris-icons';
import { NextPage } from 'next';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';

interface ThumbnailProps {
  src: string;
  alt: string;
  caption: string;
}

const Thumbnail: React.FC<ThumbnailProps> = ({ src, alt, caption }) => {
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
          width: '192px',
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
        <Image src={src} alt={alt} width={192} height={108} />
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
      >
        <div>
          {/* eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element */}
          <img src={src} style={{ width: '100%' }} />
        </div>
      </Modal>
    </>
  );
};

const Setup: NextPage = () => {
  const [state, setState] = useState({
    showCreateGoogleMapsApiKey: false,
    showSetupBillingAlerts: false,
    showSetupQuotas: false,
    setupShopifyOnlineStore10ThemeInstructionsOpen: false,
    setupShopifyOnlineStore20ThemeInstructionsOpen: false,
  });
  const shopsUpdateMutation = trpc.shops.update.useMutation();

  useEffect(() => {
    shopsUpdateMutation
      .mutateAsync({ showOnboarding: false })
      .catch((err) => Sentry.captureException(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Page>
      <Card>
        <Layout>
          <Layout.Section>
            <Layout>
              <Layout.Section>
                <Text as="h2" variant="headingMd">
                  1. Setup Google Maps
                </Text>
                <p>
                  The first thing that you&apos;ll need to do is setup Google
                  Maps. Google Maps offers $200 free credit each month which is
                  equivalent to 10000-15000 visits to your store locator. While
                  this usage will be fine for a small shop, you might go over
                  this limit if your shop receives more traffic. We have
                  instructions to add Google Maps billing alerts and quotas
                  below.
                </p>
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
                      <Text as="h3" variant="headingSm">
                        <Badge tone="critical">Required</Badge> Create Google
                        Maps API key
                      </Text>
                      <div>
                        <Button
                          fullWidth={false}
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
                      {state.showCreateGoogleMapsApiKey && (
                        <Layout>
                          <Layout.Section>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                              }}
                            >
                              <Text as="h4" variant="headingXs">
                                Step 1: Sign in and visit the Google Cloud
                                console
                              </Text>
                              <p>
                                You&apos;ll need to sign in to a Google account
                                to proceed:{' '}
                                {/* <Link url="https://console.cloud.google.com/google/maps-apis/home"> */}
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <Link
                                  target="_blank"
                                  url="https://console.cloud.google.com/home/dashboard"
                                >
                                  open Google Cloud console dashboard
                                </Link>
                              </p>
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
                              <Text as="h4" variant="headingXs">
                                Step 2: Create a new Google Cloud project
                              </Text>
                              <p>
                                If this is your first time using Google Cloud,
                                you will be asked to create a new Google Cloud
                                project. Otherwise, if you have existing
                                projects, you will need to manually create a new
                                project (see image Step 2.0, 2.1). When creating
                                your project give it a descriptive name (eg.
                                Store Locator). If you&apos;re asked to set up
                                billing, you will have to complete that as well.
                              </p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <Thumbnail
                                  src="/setup-imgs/create-google-maps-api-key/step-2-0.png"
                                  alt="step-2-0"
                                  caption="Step 2.0"
                                />
                                <Thumbnail
                                  src="/setup-imgs/create-google-maps-api-key/step-2-1.png"
                                  alt="step-2-1"
                                  caption="Step 2.1"
                                />
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
                              <Text as="h4" variant="headingXs">
                                Step 3: Activate your Google Maps account
                              </Text>
                              <p>
                                If this is this is your first time using Google
                                Cloud you have the opportunity to activate your
                                account to enable the free credits.
                              </p>
                              <div>
                                <Thumbnail
                                  src="/setup-imgs/create-google-maps-api-key/step-3-0.png"
                                  alt="step-3-0"
                                  caption="Step 3.0"
                                />
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
                              <Text as="h4" variant="headingXs">
                                Step 4: Enable Google Maps
                              </Text>
                              <p>
                                Go to the{' '}
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <Link
                                  target="_blank"
                                  url="https://console.cloud.google.com/google/maps-apis/home"
                                >
                                  Google Maps console homepage
                                </Link>
                                . If this is a new account, you&apos;ll see an
                                onboarding window (Step 4.0). Copy the API key
                                and enable the two checkboxes and continue. If
                                you&apos;re asked to protect your key (Step 4.1)
                                select{' '}
                                <Text as="span" fontWeight="bold">
                                  Websites
                                </Text>{' '}
                                and in the{' '}
                                <Text as="span" fontWeight="bold">
                                  Referrer
                                </Text>{' '}
                                enter your domain name (eg. example.com).
                              </p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <Thumbnail
                                  src="/setup-imgs/create-google-maps-api-key/step-4-0.png"
                                  alt="step-4-0"
                                  caption="Step 4.0"
                                />
                                <Thumbnail
                                  src="/setup-imgs/create-google-maps-api-key/step-4-1.png"
                                  alt="step-4-1"
                                  caption="Step 4.1"
                                />
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
                              <Text as="h4" variant="headingXs">
                                Step 5: Ensure APIs are active
                              </Text>
                              <p>
                                Go to the{' '}
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <Link
                                  target="_blank"
                                  url="https://console.cloud.google.com/google/maps-apis/api-list"
                                >
                                  Google Maps console APIs & Services tab
                                </Link>
                                . Select the filter{' '}
                                <Text as="span" fontWeight="bold">
                                  MAPS
                                </Text>{' '}
                                and ensure that the Maps JavaScript API is
                                enabled (see Step 5.0). Next select the filter{' '}
                                <Text as="span" fontWeight="bold">
                                  PLACES
                                </Text>{' '}
                                and ensure the Places API and Geocoding API are
                                both enabled (see Step 5.1).
                              </p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <Thumbnail
                                  src="/setup-imgs/create-google-maps-api-key/step-5-0.png"
                                  alt="step-5-0"
                                  caption="Step 5.0"
                                />
                                <Thumbnail
                                  src="/setup-imgs/create-google-maps-api-key/step-5-1.png"
                                  alt="step-5-1"
                                  caption="Step 5.1"
                                />
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
                              <Text as="h4" variant="headingXs">
                                Step 6: Copy your Google Maps key
                              </Text>
                              <p>
                                Go to the{' '}
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <Link
                                  target="_blank"
                                  url="https://console.cloud.google.com/google/maps-apis/credentials"
                                >
                                  Google Maps console Keys & Credentials tab
                                </Link>
                                . Find your API key (Step 6.0) and click{' '}
                                <Text as="span" fontWeight="bold">
                                  Show Key
                                </Text>{' '}
                                and then copy the key (Step 6.1) and paste it in
                                the{' '}
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                app <Link url="/settings">Settings</Link>
                              </p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <Thumbnail
                                  src="/setup-imgs/create-google-maps-api-key/step-6-0.png"
                                  alt="step-6-0"
                                  caption="Step 6.0"
                                />
                                <Thumbnail
                                  src="/setup-imgs/create-google-maps-api-key/step-6-1.png"
                                  alt="step-6-1"
                                  caption="Step 6.1"
                                />
                              </div>
                            </div>
                          </Layout.Section>
                          <Layout.Section>
                            <Button
                              fullWidth={false}
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
                              {state.showCreateGoogleMapsApiKey
                                ? 'Hide'
                                : 'Show'}{' '}
                              instructions
                            </Button>
                          </Layout.Section>
                        </Layout>
                      )}
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
                        <Badge tone="warning">Optional</Badge> Set up billing
                        alerts to track Google Maps usage
                      </Text>
                      <div>
                        <Button
                          fullWidth={false}
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
                      {state.showSetupBillingAlerts && (
                        <Layout>
                          <Layout.Section>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                              }}
                            >
                              <Text as="h4" variant="headingXs">
                                Step 1: Go to the Google Cloud billing page
                              </Text>
                              <p>
                                Go to the{' '}
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <Link
                                  target="_blank"
                                  url="https://console.cloud.google.com/billing"
                                >
                                  Google Cloud billing page
                                </Link>{' '}
                                and find the billing account associated with the
                                project you created. If no account exists, you
                                need to create one.
                              </p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <Thumbnail
                                  src="/setup-imgs/setup-billing-alerts/step-1-0.png"
                                  alt="step-1-0"
                                  caption="Step 1.0"
                                />
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
                              <Text as="h4" variant="headingXs">
                                Step 2: Select the account and go to Budgets &
                                alerts
                              </Text>
                              <p>
                                Select the account you found above, click it and
                                then open{' '}
                                <Text as="span" fontWeight="bold">
                                  Budgets & alerts
                                </Text>{' '}
                                .
                              </p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <Thumbnail
                                  src="/setup-imgs/setup-billing-alerts/step-2-0.png"
                                  alt="step-2-0"
                                  caption="Step 2.0"
                                />
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
                              <Text as="h4" variant="headingXs">
                                Step 3: Create a new budget
                              </Text>
                              <p>
                                If you followed the Google Maps API key setup
                                above you should have some default budgets. If
                                you&apos;d still like to add another click{' '}
                                <Text as="span" fontWeight="bold">
                                  Create Budget
                                </Text>{' '}
                              </p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <Thumbnail
                                  src="/setup-imgs/setup-billing-alerts/step-3-0.png"
                                  alt="step-3-0"
                                  caption="Step 3.0"
                                />
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
                              <Text as="h4" variant="headingXs">
                                Step 4: Configure budget
                              </Text>
                              <p>
                                Give your budget a descriptive name, ensure the
                                two checkboxes are both checked and then press{' '}
                                <Text as="span" fontWeight="bold">
                                  Next
                                </Text>
                                .
                              </p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <Thumbnail
                                  src="/setup-imgs/setup-billing-alerts/step-4-0.png"
                                  alt="step-4-0"
                                  caption="Step 4.0"
                                />
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
                              <Text as="h4" variant="headingXs">
                                Step 5: Configure total budget amount
                              </Text>
                              <p>
                                Choose a total budget amount for the budget. If
                                you would like to track free usage enter $200.
                                Click{' '}
                                <Text as="span" fontWeight="bold">
                                  Next
                                </Text>
                                .
                              </p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <Thumbnail
                                  src="/setup-imgs/setup-billing-alerts/step-5-0.png"
                                  alt="step-5-0"
                                  caption="Step 5.0"
                                />
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
                              <Text as="h4" variant="headingXs">
                                Step 6: Configure alert threshold rules
                              </Text>
                              <p>
                                Optionally configure the alert threshold rules
                                for your budget and click{' '}
                                <Text as="span" fontWeight="bold">
                                  Finish
                                </Text>{' '}
                                .
                              </p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <Thumbnail
                                  src="/setup-imgs/setup-billing-alerts/step-6-0.png"
                                  alt="step-6-0"
                                  caption="Step 6.0"
                                />
                              </div>
                            </div>
                          </Layout.Section>
                        </Layout>
                      )}
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
                      <div>
                        <Button
                          fullWidth={false}
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
                      {state.showSetupQuotas && (
                        <Layout>
                          <Layout.Section>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                              }}
                            >
                              <p>The locator uses three Google Maps APIs:</p>
                              <List type="bullet">
                                <List.Item>
                                  Maps JavaScript API: One map load is used each
                                  time someone visits the page with your store
                                  locator{' '}
                                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                  <Link
                                    target="_blank"
                                    url="https://developers.google.com/maps/documentation/javascript/usage-and-billing"
                                  >
                                    Google pricing page for the Maps JavsScript
                                    API.
                                  </Link>
                                </List.Item>
                                <List.Item>
                                  Geocoding API: One request is used each time
                                  someone types a search and clicks the search
                                  button (or presses the Enter key).{' '}
                                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                  <Link
                                    target="_blank"
                                    url="https://developers.google.com/maps/documentation/geocoding/usage-and-billing#pricing-for-product"
                                  >
                                    Google pricing page for the Geocoding API.
                                  </Link>
                                </List.Item>
                                <List.Item>
                                  Places API: One request is used each time a
                                  visitor types a letter in the search box (eg.
                                  typing &quot;N&quot;, &quot;Y&quot;,
                                  &quot;C&quot; to spell &quot;NYC&quot; would
                                  use 3 requests).{' '}
                                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                  <Link
                                    target="_blank"
                                    url="https://developers.google.com/maps/documentation/places/web-service/usage-and-billing"
                                  >
                                    Google pricing page for the Places API.
                                  </Link>
                                </List.Item>
                              </List>
                              <p>
                                In this section you will add a quota to some or
                                all of these Google Maps APIs.
                              </p>
                              <ExceptionList
                                items={[
                                  {
                                    icon: AlertTriangleIcon,
                                    status: 'critical',
                                    description:
                                      "We don't recommend setting quotas first if you're planning on bulk importing your locations. It's prefereable to do the bulk import and then add quotas.",
                                  },
                                ]}
                              />
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
                              <Text as="h4" variant="headingXs">
                                Step 1: Open the Google Maps Quotas page
                              </Text>
                              <p>
                                Open the{' '}
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <Link
                                  target="_blank"
                                  url="https://console.cloud.google.com/google/maps-apis/quotas"
                                >
                                  Google Maps Quotas page
                                </Link>{' '}
                                and ensure you have the correct project
                                selected.
                              </p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <Thumbnail
                                  src="/setup-imgs/setup-quotas/step-1-0.png"
                                  alt="step-1-0"
                                  caption="Step 1.0"
                                />
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
                              <Text as="h4" variant="headingXs">
                                Step 2: Select which API you&apos;d like to
                                create a limit for
                              </Text>
                              <p>
                                Choose one of{' '}
                                <Text as="span" fontWeight="bold">
                                  Maps JavaScript API
                                </Text>
                                ,{' '}
                                <Text as="span" fontWeight="bold">
                                  Geocoding API
                                </Text>
                                ,{' '}
                                <Text as="span" fontWeight="bold">
                                  Places API
                                </Text>
                                .
                              </p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <Thumbnail
                                  src="/setup-imgs/setup-quotas/step-2-0.png"
                                  alt="step-2-0"
                                  caption="Step 2.0"
                                />
                                <Thumbnail
                                  src="/setup-imgs/setup-quotas/step-2-1.png"
                                  alt="step-2-1"
                                  caption="Step 2.1"
                                />
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
                              <Text as="h4" variant="headingXs">
                                Step 3a: Add Maps JavaScript API quota
                              </Text>
                              <p>
                                Choose Maps JavaScript API in the API dropdown,
                                expand the{' '}
                                <Text as="span" fontWeight="bold">
                                  Map loads
                                </Text>{' '}
                                section and then you can edit the quotas. We
                                recommend setting the{' '}
                                <Text as="span" fontWeight="bold">
                                  Map loads per day
                                </Text>{' '}
                                value to at least 350 for a low traffic shop.
                              </p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <Thumbnail
                                  src="/setup-imgs/setup-quotas/step-3a-0.png"
                                  alt="step-3a-0"
                                  caption="Step 3a.0"
                                />
                                <Thumbnail
                                  src="/setup-imgs/setup-quotas/step-3a-1.png"
                                  alt="step-3a-1"
                                  caption="Step 3a.1"
                                />
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
                              <Text as="h4" variant="headingXs">
                                Step 3b: Add Geocoding API quota
                              </Text>
                              <p>
                                Choose Geocoding API in the API dropdown, expand
                                the{' '}
                                <Text as="span" fontWeight="bold">
                                  Requests
                                </Text>{' '}
                                section and then you can edit the quotas. We
                                recommend setting the{' '}
                                <Text as="span" fontWeight="bold">
                                  Requests per day
                                </Text>{' '}
                                value to at least 350 for a low traffic shop.
                              </p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <Thumbnail
                                  src="/setup-imgs/setup-quotas/step-3b-0.png"
                                  alt="step-3b-0"
                                  caption="Step 3b.0"
                                />
                                <Thumbnail
                                  src="/setup-imgs/setup-quotas/step-3b-1.png"
                                  alt="step-3b-1"
                                  caption="Step 3b.1"
                                />
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
                              <Text as="h4" variant="headingXs">
                                Step 3c: Add Places API quota
                              </Text>
                              <p>
                                Choose Places API in the API dropdown, expand
                                the{' '}
                                <Text as="span" fontWeight="bold">
                                  Requests
                                </Text>{' '}
                                section and then you can edit the quotas. We
                                recommend setting the{' '}
                                <Text as="span" fontWeight="bold">
                                  Requests per day
                                </Text>{' '}
                                value to at least 100 for a low traffic shop.
                              </p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <Thumbnail
                                  src="/setup-imgs/setup-quotas/step-3c-0.png"
                                  alt="step-3c-0"
                                  caption="Step 3c.0"
                                />
                                <Thumbnail
                                  src="/setup-imgs/setup-quotas/step-3c-1.png"
                                  alt="step-3c-1"
                                  caption="Step 3c.1"
                                />
                              </div>
                            </div>
                          </Layout.Section>
                        </Layout>
                      )}
                    </div>
                  </Layout.Section>
                </Layout>
              </Layout.Section>
            </Layout>
          </Layout.Section>
          <Layout.Section>
            <Text as="h2" variant="headingMd">
              2a. Setup Shopify Online Store 1.0 Theme
            </Text>
            <Collapsible
              id="setupShopifyOnlineStore10ThemeCollapsible"
              open={state.setupShopifyOnlineStore10ThemeInstructionsOpen}
            >
              <Layout>
                <Layout.Section>Step 1: WIP</Layout.Section>
              </Layout>
            </Collapsible>
          </Layout.Section>
          <Layout.Section>
            <Text as="h2" variant="headingMd">
              2b. Setup Shopify Online Store 2.0 Theme
            </Text>
            <Collapsible
              id="setupShopifyOnlineStore20ThemeCollapsible"
              open={state.setupShopifyOnlineStore20ThemeInstructionsOpen}
            >
              <Layout>
                <Layout.Section>Step 1: WIP</Layout.Section>
              </Layout>
            </Collapsible>
          </Layout.Section>
        </Layout>
      </Card>
    </Page>
  );
};

export default Setup;
