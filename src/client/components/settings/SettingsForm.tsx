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
import { useEffect, useState } from 'react';
import {
  Plan,
  SearchFilterSyncInput,
  SettingsUpdateInput,
  Shop,
} from '@/dto/trpc';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Sentry from '@sentry/nextjs';
import { trpc } from '@/lib/trpc';
import { toast } from '@/client/lib/toast';
import { timezones } from '@/lib/timezones';
import { z } from 'zod';
import { PlansModal } from '../billing/PlansModal';
import { SearchFilters } from './SearchFilters';

export const FormData = z.object({
  settings: SettingsUpdateInput,
  searchFilters: SearchFilterSyncInput,
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FormData = z.infer<typeof FormData>;

export interface SettingsFormProps {
  shop: Shop;
  plans: Plan[];
  defaultFormValues: FormData;
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
  const searchFiltersSyncMutation = trpc.searchFilters.sync.useMutation();
  const {
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(FormData),
    defaultValues: defaultFormValues,
  });
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const [settingsResult, searchFiltersResult] = await Promise.all([
        settingsUpdateMutation.mutateAsync({
          googleMapsApiKey: data.settings.googleMapsApiKey,
          timezone: data.settings.timezone,
        }),
        searchFiltersSyncMutation.mutateAsync(data.searchFilters),
      ]);
      reset({
        settings: settingsResult.settings,
        searchFilters: searchFiltersResult.searchFilters,
      });
      await Promise.all([
        utils.settings.get.invalidate(),
        utils.searchFilters.getAll.invalidate(),
      ]);
      toast('success', 'Settings saved');
    } catch (err) {
      Sentry.captureException(err);
      toast('error', 'Failed to save settings');
    }
  };
  // Handle navigating away from the page
  useEffect(() => {
    window.onbeforeunload = () => {
      if (isDirty) {
        // Show dialog to confirm navigation
        return '';
      }

      // Don't show dialog
      return undefined;
    };

    return () => {
      window.onbeforeunload = null;
    };
  }, [isDirty]);

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
              name="settings.googleMapsApiKey"
              render={({ field }) => {
                return (
                  <TextField
                    autoComplete="off"
                    label="Google Maps API key"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.settings?.googleMapsApiKey?.message}
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
              name="settings.timezone"
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
                    error={errors.settings?.timezone?.message}
                    helpText="This is used for analytics to display data in your timezone. Choose the location closest to you."
                  />
                );
              }}
            />
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          title="Search filters"
          description="Update your search filters here"
        >
          <Card>
            <Controller
              control={control}
              name="searchFilters"
              render={({ field }) => {
                return (
                  <SearchFilters
                    searchFilters={field.value}
                    onChange={(searchFilters) => {
                      field.onChange(searchFilters);
                    }}
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
