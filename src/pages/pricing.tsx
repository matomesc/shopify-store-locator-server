import { Spinner } from '@/client/components/Spinner';
import { trpc } from '@/lib/trpc';
import { Button, Card, Divider, Page, Text } from '@shopify/polaris';
import { NextPage } from 'next';
import Head from 'next/head';
import { ReactNode } from 'react';

interface PlanProps {
  name: string;
  price: number;
  features: React.ReactNode;
}

const Plan: React.FC<PlanProps> = ({ name, price, features }) => {
  return (
    <div
      style={{
        borderRadius: '12px',
        border: '1px solid rgba(138, 138, 138, 1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          background: 'rgba(243, 243, 243, 1)',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          borderBottomLeftRadius: '0px',
          borderBottomRightRadius: '0px',
        }}
      >
        <Text as="span" fontWeight="bold">
          {name}
        </Text>
        <Text as="span">${price}/month</Text>
      </div>
      <div style={{ padding: '16px' }}>{features}</div>
    </div>
  );
};

const Pricing: NextPage = () => {
  const plansGetAllQuery = trpc.plans.getAll.useQuery();

  if (plansGetAllQuery.isPending) {
    return <Spinner />;
  }

  if (plansGetAllQuery.isError) {
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
                await Promise.all([plansGetAllQuery.refetch()]);
              }}
            >
              Retry
            </Button>
          </div>
        </Card>
      </Page>
    );
  }

  const freePlan = plansGetAllQuery.data.plans.find(
    (plan) => plan.id === 'free',
  );
  const starterPlan = plansGetAllQuery.data.plans.find(
    (plan) => plan.id === 'starter',
  );
  const proPlan = plansGetAllQuery.data.plans.find((plan) => plan.id === 'pro');
  const enterprisePlan = plansGetAllQuery.data.plans.find(
    (plan) => plan.id === 'enterprise',
  );
  const unlimitedPlan = plansGetAllQuery.data.plans.find(
    (plan) => plan.id === 'unlimited',
  );

  return (
    <>
      <Head>
        <title>Pricing</title>
      </Head>
      <Page title="Pricing" fullWidth>
        <Card>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center',
            }}
          >
            {[
              freePlan,
              starterPlan,
              proPlan,
              enterprisePlan,
              unlimitedPlan,
            ].map((plan) => {
              if (!plan) {
                return null;
              }

              let features: ReactNode;

              switch (plan.id) {
                case 'free':
                  features = (
                    <div>
                      <div>
                        <Text as="span" fontWeight="bold">
                          {plan.locationsLimit}
                        </Text>{' '}
                        locations
                      </div>
                      <Divider />
                      <div>
                        <Text as="span" fontWeight="bold">
                          {plan.languagesLimit}
                        </Text>{' '}
                        display language
                      </div>
                      <Divider />
                      <div>Spreadsheet bulk import</div>
                      <Divider />
                      <div>Unlimited search filters</div>
                      <Divider />
                      <div>Unlimited custom fields</div>
                      <Divider />
                      <div>Unlimited custom actions</div>
                      <Divider />
                      <div>Customize appearance</div>
                      <Divider />
                      <div>Customize map markers</div>
                      <Divider />
                      <div>
                        Analytics ({plan.analyticsRetention} day retention)
                      </div>
                    </div>
                  );
                  break;
                case 'starter':
                  features = (
                    <div>
                      <div>Everything in free plus:</div>
                      <Divider />
                      <div>
                        <Text as="span" fontWeight="bold">
                          {plan.locationsLimit}
                        </Text>{' '}
                        locations
                      </div>
                      <Divider />
                      <div>
                        <Text as="span" fontWeight="bold">
                          {plan.languagesLimit}
                        </Text>{' '}
                        display languages
                      </div>
                      <Divider />
                      <div>
                        Analytics ({plan.analyticsRetention} day retention)
                      </div>
                      <Divider />
                      <div>Basic support</div>
                    </div>
                  );
                  break;
                case 'pro':
                  features = (
                    <div>
                      <div>Everything in starter plus:</div>
                      <Divider />
                      <div>
                        <Text as="span" fontWeight="bold">
                          {plan.locationsLimit}
                        </Text>{' '}
                        locations
                      </div>
                      <Divider />
                      <div>
                        <Text as="span" fontWeight="bold">
                          {plan.languagesLimit}
                        </Text>{' '}
                        display languages
                      </div>
                      <Divider />
                      <div>
                        Analytics ({plan.analyticsRetention} day retention)
                      </div>
                      <Divider />
                      <div>Priority support</div>
                    </div>
                  );
                  break;
                case 'enterprise':
                  features = (
                    <div>
                      <div>Everything in pro plus:</div>
                      <Divider />
                      <div>
                        <Text as="span" fontWeight="bold">
                          {plan.locationsLimit}
                        </Text>{' '}
                        locations
                      </div>
                      <Divider />
                      <div>
                        <Text as="span" fontWeight="bold">
                          {plan.languagesLimit}
                        </Text>{' '}
                        display languages
                      </div>
                      <Divider />
                      <div>
                        Analytics ({plan.analyticsRetention} day retention)
                      </div>
                      <Divider />
                      <div>API access (coming soon)</div>
                    </div>
                  );
                  break;
                case 'unlimited':
                  features = (
                    <div>
                      <div>Everything in enterprise plus:</div>
                      <Divider />
                      <div>
                        <Text as="span" fontWeight="bold">
                          Unlimited
                        </Text>{' '}
                        locations
                      </div>
                      <Divider />
                      <div>
                        <Text as="span" fontWeight="bold">
                          Unlimited
                        </Text>{' '}
                        display languages
                      </div>
                      <Divider />
                      <div>
                        Analytics ({plan.analyticsRetention} day retention)
                      </div>
                    </div>
                  );
                  break;
                default:
                  features = <div />;
              }

              return (
                <div
                  key={plan.id}
                  style={{
                    flexBasis: '200px',
                  }}
                >
                  <Plan
                    name={plan.name}
                    price={plan.price}
                    features={features}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      </Page>
    </>
  );
};

export default Pricing;
