import {
  Button,
  Card,
  Layout,
  Link,
  Page,
  Text,
  TextField,
} from '@shopify/polaris';
import { useEffect, useState } from 'react';
import { Plan, SettingsUpdateInput, Shop } from '@/dto/trpc';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  APIProvider,
  useMapsLibrary,
  Map,
  useMap,
} from '@vis.gl/react-google-maps';
import * as Sentry from '@sentry/nextjs';
import { trpc } from '@/lib/trpc';
import { toast } from '@/client/lib/toast';
import { PlansModal } from '../billing/PlansModal';

export interface SettingsFormProps {
  shop: Shop;
  plans: Plan[];
  defaultFormValues: SettingsUpdateInput;
}

export const ApiKeyStatus: React.FC = () => {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');
  const [state, setState] = useState({
    isValid: false,
  });

  useEffect(() => {
    if (!placesLib || !geocodingLib || !map) return;

    const places = new placesLib.PlacesService(map);
    const geocoder = new geocodingLib.Geocoder();

    const testApiKey = async () => {
      let geocoderTest: boolean | null = null;
      let placesTest: boolean | null = null;

      geocoder
        .geocode(
          { address: '1600 Amphitheatre Parkway, Mountain View, California' },
          (result, status) => {
            console.log('geocode result', result);
            if (status === google.maps.GeocoderStatus.OK) {
              geocoderTest = true;
            }
            geocoderTest = false;

            if (
              typeof geocoderTest === 'boolean' &&
              typeof placesTest === 'boolean'
            ) {
              if (geocoderTest && placesTest) {
                setState((prevState) => {
                  return {
                    ...prevState,
                    isValid: true,
                  };
                });
              }
            }
          },
        )
        .catch((err) => {
          console.log('Test geocoder error', err);
        });
      places.textSearch(
        { query: '1600 Amphitheatre Parkway, Mountain View, California' },
        (result, status) => {
          console.log('place search result', result);
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            placesTest = true;
          }
          placesTest = false;

          if (
            typeof geocoderTest === 'boolean' &&
            typeof placesTest === 'boolean'
          ) {
            if (geocoderTest && placesTest) {
              setState((prevState) => {
                return {
                  ...prevState,
                  isValid: true,
                };
              });
            }
          }
        },
      );
    };

    testApiKey().catch((err) => {
      Sentry.captureException(err);
    });

    // ...
  }, [placesLib, map, geocodingLib]);

  return <div>{state.isValid ? 'Valid' : 'Invalid'}</div>;
};

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
    watch,
  } = useForm({
    resolver: zodResolver(SettingsUpdateInput),
    defaultValues: defaultFormValues,
  });
  const onSubmit: SubmitHandler<SettingsUpdateInput> = async (data) => {
    try {
      await settingsUpdateMutation.mutateAsync({
        googleMapsApiKey: data.googleMapsApiKey,
      });
      await utils.settings.get.invalidate();
      toast('success', 'Settings updated successfully');
    } catch (err) {
      toast('success', 'Failed to update settings');
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
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}{' '}
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
                  />
                );
              }}
            />
          </Card>
        </Layout.AnnotatedSection>
      </Layout>
    </Page>
  );
};
