import { PlansModal } from '@/client/components/billing/PlansModal';
import { Spinner } from '@/client/components/Spinner';
import { trpc } from '@/lib/trpc';
import { Button, Card, Layout, Page, Text } from '@shopify/polaris';
import { NextPage } from 'next';
import { useState } from 'react';

const Settings: NextPage = () => {
  const [state, setState] = useState({
    plansModalOpen: false,
  });
  const shopsGetQuery = trpc.shops.get.useQuery();
  const plansGetAllQuery = trpc.plans.getAll.useQuery();

  if (shopsGetQuery.isPending || plansGetAllQuery.isPending) {
    return <Spinner />;
  }

  if (shopsGetQuery.isError || plansGetAllQuery.isError) {
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
    <Page>
      <Layout>
        <Layout.AnnotatedSection
          title="Billing"
          description="Update your billing plan here"
        >
          <Card>
            Your current plan is{' '}
            <Text as="span" fontWeight="bold">
              {shopsGetQuery.data.shop.plan.name}
            </Text>{' '}
            @ ${shopsGetQuery.data.shop.planCharge?.price || '0.00'} / month{' '}
            <Button
              onClick={() => {
                setState((prevState) => {
                  return {
                    ...prevState,
                    plansModalOpen: true,
                  };
                });
              }}
            >
              Change plan
            </Button>
          </Card>
          <PlansModal
            open={state.plansModalOpen}
            currentPlanId={shopsGetQuery.data.shop.planId}
            plans={plansGetAllQuery.data.plans}
            onClose={() => {
              setState((prevState) => {
                return {
                  ...prevState,
                  plansModalOpen: false,
                };
              });
            }}
          />
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
};

export default Settings;
