import { Button, Card, Layout, Page, TabProps, Tabs } from '@shopify/polaris';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { APIProvider } from '@vis.gl/react-google-maps';
import { trpc } from '@/lib/trpc';
import { Spinner } from '@/client/components/Spinner';
import { Loads } from '@/client/components/analytics/Loads';
import { Searches } from '@/client/components/analytics/Searches';
import { Locations } from '@/client/components/analytics/Locations';

const tabs: TabProps[] = [
  {
    id: 'loads',
    content: 'Map loads',
  },
  {
    id: 'searches',
    content: 'Searches',
  },
  {
    id: 'locations',
    content: 'Popular locations',
  },
];

const Analytics: NextPage = () => {
  const router = useRouter();
  const [state, setState] = useState({
    selectedTab: 0,
  });
  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const tabId = router.query.tab;

    if (typeof tabId === 'string') {
      let tabIndex = tabs.findIndex((tab) => tab.id === tabId);

      if (tabIndex === -1) {
        tabIndex = 0;
      }

      setState((prevState) => {
        return {
          ...prevState,
          selectedTab: tabIndex,
        };
      });
    }
  }, [router.isReady, router.query.tab]);
  const settingsGetQuery = trpc.settings.get.useQuery();

  if (settingsGetQuery.isPending) {
    return <Spinner />;
  }

  if (settingsGetQuery.isError) {
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
                await Promise.all([settingsGetQuery.refetch()]);
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
    <Page title="Analytics">
      <APIProvider apiKey={settingsGetQuery.data.settings.googleMapsApiKey}>
        <Tabs
          tabs={tabs}
          selected={state.selectedTab}
          onSelect={(tabIndex) => {
            setState((prevState) => {
              return {
                ...prevState,
                selectedTab: tabIndex,
              };
            });
            router
              .push(
                { query: { ...router.query, tab: tabs[tabIndex].id } },
                undefined,
                { shallow: true },
              )
              .catch((err) => {
                Sentry.captureException(err);
              });
          }}
        >
          {state.selectedTab === 0 && <Loads />}
          {state.selectedTab === 1 && <Searches />}
          {state.selectedTab === 2 && <Locations />}
        </Tabs>
      </APIProvider>
    </Page>
  );
};

export default Analytics;
