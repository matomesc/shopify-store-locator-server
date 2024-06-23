import {
  Button,
  Card,
  Layout,
  Link,
  Page,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import { useState } from 'react';
import { Plan, SettingsUpdateInput, Shop } from '@/dto/trpc';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Sentry from '@sentry/nextjs';
import { trpc } from '@/lib/trpc';
import { toast } from '@/client/lib/toast';
import { timezones } from '@/lib/timezones';
import { PlansModal } from '../billing/PlansModal';

export interface SettingsFormProps {
  shop: Shop;
  plans: Plan[];
  defaultFormValues: SettingsUpdateInput;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  shop,
  plans,
  defaultFormValues,
}) => {
  const utils = trpc.useUtils();
  const [state, setState] = useState({
    plansModalOpen: false,
  });
  const settingsUpdateMutation = trpc.settings.update.useMutation();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SettingsUpdateInput),
    defaultValues: defaultFormValues,
  });
  const onSubmit: SubmitHandler<SettingsUpdateInput> = async (data) => {
    try {
      await settingsUpdateMutation.mutateAsync({
        googleMapsApiKey: data.googleMapsApiKey,
        timezone: data.timezone,
      });
      await utils.settings.get.invalidate();
      toast('success', 'Settings saved');
    } catch (err) {
      toast('error', 'Failed to save settings');
    }
  };

  return (
    <Page
      title="Settings"
      primaryAction={{
        content: 'Save',
        onAction: () => {
          handleSubmit(onSubmit)().catch((err) => {
            Sentry.captureException(err);
          });
        },
      }}
    >
      <Layout>
        <Layout.AnnotatedSection
          title="Billing"
          description="Update your billing plan here"
        >
          <Card>
            Your current plan is{' '}
            <Text as="span" fontWeight="bold">
              {shop.plan.name}
            </Text>{' '}
            @ ${shop.planCharge?.price || '0.00'} / month{' '}
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
            currentPlanId={shop.planId}
            plans={plans}
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
        <Layout.AnnotatedSection
          title="Google Maps"
          description={
            <p>
              Update your Google Maps API key here. You can create one with the
              instructions on the <Link url="/setup">setup page</Link>
            </p>
          }
        >
          <Card>
            <Controller
              control={control}
              name="googleMapsApiKey"
              render={({ field }) => {
                return (
                  <TextField
                    autoComplete="off"
                    label="Google Maps API key"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.googleMapsApiKey?.message}
                  />
                );
              }}
            />
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection title="General">
          <Card>
            <Controller
              control={control}
              name="timezone"
              render={({ field }) => {
                return (
                  <Select
                    label="Timezone"
                    options={[
                      { label: 'UTC', value: '' },
                      ...timezones.map((tz) => {
                        return {
                          label: tz,
                          value: tz,
                        };
                      }),
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.timezone?.message}
                    helpText="This is used for analytics to display data in your timezone"
                  />
                );
              }}
            />
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection title="Appearance">
          <Card>Appearance</Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
};
