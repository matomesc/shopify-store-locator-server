import { Badge, Button, Divider, Text } from '@shopify/polaris';
import { ReactNode, useState } from 'react';
import { Plan as PlanDto } from '@/dto/trpc';
import { trpc } from '@/lib/trpc';
import { toast } from '@/client/lib/toast';
import { useRouter } from 'next/router';
import * as Sentry from '@sentry/nextjs';
import { Modal } from '../Modal';

interface PlanProps {
  name: string;
  price: number;
  selected: boolean;
  features: ReactNode;
  onClick: () => void;
}

const Plan: React.FC<PlanProps> = ({
  name,
  price,
  selected,
  features,
  onClick,
}) => {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="container"
      onClick={onClick}
      style={{
        borderRadius: '12px',
        border: `1px solid ${
          selected ? 'rgba(4, 123, 93, 1)' : 'rgba(138, 138, 138, 1)'
        }`,
        cursor: 'pointer',
      }}
    >
      <div
        className="header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          background: selected
            ? 'rgba(205, 254, 212, 1)'
            : 'rgba(243, 243, 243, 1)',
          // Match border with container border so the header doesn't overflow
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
      <div className="features" style={{ padding: '16px' }}>
        {features}
      </div>
    </div>
  );
};

export interface PlansModalProps {
  currentPlanId: string;
  plans: PlanDto[];
  open: boolean;
  onClose: () => void;
}

export const PlansModal: React.FC<PlansModalProps> = ({
  currentPlanId,
  plans,
  open,
  onClose,
}) => {
  const router = useRouter();
  const [state, setState] = useState({
    selectedPlanId: currentPlanId,
  });
  const utils = trpc.useUtils();
  const billingCreateChargeMutation = trpc.billing.createCharge.useMutation();
  const shopsUpdateMutation = trpc.shops.update.useMutation();

  const freePlan = plans.find((plan) => plan.id === 'free');
  const starterPlan = plans.find((plan) => plan.id === 'starter');
  const proPlan = plans.find((plan) => plan.id === 'pro');
  const enterprisePlan = plans.find((plan) => plan.id === 'enterprise');
  const unlimitedPlan = plans.find((plan) => plan.id === 'unlimited');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Select your plan"
      footer={
        <Button
          onClick={async () => {
            onClose();

            if (currentPlanId === state.selectedPlanId) {
              // Plan didn't change - do nothing
              return;
            }

            try {
              if (currentPlanId !== 'free' && state.selectedPlanId === 'free') {
                // Downgrade to free plan
                await shopsUpdateMutation.mutateAsync({ planId: 'free' });
                await utils.shops.get.invalidate();

                toast('success', 'Downgraded to free plan');

                return;
              }

              // Create a charge
              const charge = await billingCreateChargeMutation.mutateAsync({
                planId: state.selectedPlanId,
              });

              // Redirect user to accept charge
              router
                .push(
                  `/redirect?redirectUrl=${encodeURIComponent(
                    charge.charge.confirmationUrl,
                  )}`,
                )
                .catch((err) => {
                  Sentry.captureException(err);
                });
            } catch (err) {
              // We shouldn't error here so we'll log the error to Sentry
              Sentry.captureException(err);

              toast('error', 'Failed to change plan');
            }
          }}
        >
          Continue
        </Button>
      }
      height="fit-content"
      maxWidth="1200px"
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
        }}
      >
        {[freePlan, starterPlan, proPlan, enterprisePlan, unlimitedPlan].map(
          (plan) => {
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
                  selected={state.selectedPlanId === plan.id}
                  features={features}
                  onClick={() => {
                    setState((prevState) => {
                      return {
                        ...prevState,
                        selectedPlanId: plan.id,
                      };
                    });
                  }}
                />
                {currentPlanId === plan.id && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <Badge tone="success">Current plan</Badge>
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>
    </Modal>
  );
};
