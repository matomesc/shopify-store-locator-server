import { toast } from '@/client/lib/toast';
import { LocationsCreateInput } from '@/dto/trpc';
import { trpc } from '@/lib/trpc';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Banner,
  Card,
  FormLayout,
  Layout,
  Page,
  RadioButton,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import * as Sentry from '@sentry/nextjs';
import { countries } from '@/lib/countries';
import {
  AdvancedMarker,
  Map,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { useEffect, useRef } from 'react';

export interface LocationFormProps {
  mode: 'create' | 'edit';
  defaultFormValues: LocationsCreateInput;
}

export const LocationForm: React.FC<LocationFormProps> = ({
  mode,
  defaultFormValues,
}) => {
  const map = useMap();
  const placesLibrary = useMapsLibrary('places');
  const locationsCreateMutation = trpc.locations.create.useMutation();
  const locationsUpdateMutation = trpc.locations.update.useMutation();
  const autocompleteContainerRef = useRef<HTMLDivElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(LocationsCreateInput),
    defaultValues: defaultFormValues,
  });
  useEffect(() => {
    if (!placesLibrary || autocompleteRef.current) {
      return;
    }

    const input = autocompleteContainerRef?.current?.querySelector('input');

    if (!input) {
      return;
    }

    // Initialize a new autocomplete component
    autocompleteRef.current = new placesLibrary.Autocomplete(input);
    // Select the geometry field so we can get the latitute and longitude
    // See for full list of fields: https://developers.google.com/maps/documentation/javascript/places#place_search_fields
    autocompleteRef.current.setFields(['geometry', 'address_components']);

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();

      if (!place || !place.address_components || !place.geometry) {
        return;
      }

      const streetNumber =
        place.address_components.find((c) => {
          return c.types.includes('street_number');
        })?.short_name || '';
      const street =
        place.address_components.find((c) => {
          return c.types.includes('route');
        })?.short_name || '';
      const city =
        place.address_components.find((c) => {
          return c.types.includes('locality');
        })?.long_name || '';
      const state =
        place.address_components.find((c) => {
          return c.types.includes('administrative_area_level_1');
        })?.short_name || '';
      const zip =
        place.address_components.find((c) => {
          return c.types.includes('postal_code');
        })?.short_name || '';
      const country =
        place.address_components.find((c) => {
          return c.types.includes('country');
        })?.short_name || '';
      const lat = place.geometry.location?.lat() || 39;
      const lng = place.geometry.location?.lng() || 34;

      if (map) {
        map.setCenter({ lat, lng });
        map.setZoom(15);
      }

      setValue('address1', `${streetNumber} ${street}`);
      setValue('city', city);
      setValue('state', state);
      setValue('zip', zip);
      setValue('country', country);
      setValue('lat', lat);
      setValue('lng', lng);
    });
  }, [map, placesLibrary, setValue]);
  const onSubmit: SubmitHandler<LocationsCreateInput> = async (data) => {
    try {
      if (mode === 'create') {
        await locationsCreateMutation.mutateAsync(data);
      } else if (mode === 'edit') {
        await locationsUpdateMutation.mutateAsync(data);
      }
    } catch (err) {
      // Shouldn't error here
      toast('error', 'Failed to save location');
      Sentry.captureException(err);
      return;
    }

    toast('success', 'Location saved');
  };

  return (
    <Page
      title={mode === 'create' ? 'Add new location' : 'Edit location'}
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
        <Layout.Section>
          <Card>
            <Layout>
              <Layout.Section>
                <Text as="h2" variant="headingMd">
                  General
                </Text>
              </Layout.Section>
              <Layout.Section>
                <Banner title="Visibility">
                  <p>
                    These fields are all visible on your storefront. If you
                    don&apos;t want to show a particular value, leave it blank.
                  </p>
                </Banner>
              </Layout.Section>
              <Layout.Section>
                <FormLayout>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field }) => {
                      return (
                        <TextField
                          label="Name"
                          autoComplete="off"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          helpText="Give your location a unique name."
                          error={errors.name?.message}
                        />
                      );
                    }}
                  />
                  <Controller
                    control={control}
                    name="active"
                    render={({ field }) => {
                      return (
                        <div>
                          <RadioButton
                            label="Location is active"
                            helpText="If active, this location will be visible in your storefront"
                            checked={field.value}
                            onChange={() => {
                              field.onChange(true);
                            }}
                          />
                          <RadioButton
                            label="Location is inactive"
                            helpText="If inactive, this location will not be visible in your storefront"
                            id="optional"
                            name="accounts"
                            checked={!field.value}
                            onChange={() => {
                              field.onChange(false);
                            }}
                          />
                        </div>
                      );
                    }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flexBasis: '50%' }}>
                      <Controller
                        control={control}
                        name="email"
                        render={({ field }) => {
                          return (
                            <TextField
                              label="Email"
                              autoComplete="off"
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              error={errors.email?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '50%' }}>
                      <Controller
                        control={control}
                        name="phone"
                        render={({ field }) => {
                          return (
                            <TextField
                              label="Phone"
                              autoComplete="off"
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              error={errors.phone?.message}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                  <Controller
                    control={control}
                    name="website"
                    render={({ field }) => {
                      return (
                        <TextField
                          label="Website"
                          autoComplete="off"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={errors.website?.message}
                        />
                      );
                    }}
                  />
                </FormLayout>
              </Layout.Section>
            </Layout>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <Layout>
              <Layout.Section>
                <Text as="h2" variant="headingMd">
                  Address
                </Text>
              </Layout.Section>
              <Layout.Section>
                <FormLayout>
                  <div ref={autocompleteContainerRef}>
                    <Controller
                      control={control}
                      name="address1"
                      render={({ field }) => {
                        return (
                          <TextField
                            label="Address"
                            autoComplete="off"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="Search for an address..."
                            error={errors.address1?.message}
                          />
                        );
                      }}
                    />
                  </div>
                  <Controller
                    control={control}
                    name="address2"
                    render={({ field }) => {
                      return (
                        <TextField
                          label="Apartment, suite, etc."
                          autoComplete="off"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={errors.address2?.message}
                        />
                      );
                    }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flexBasis: '50%' }}>
                      <Controller
                        control={control}
                        name="city"
                        render={({ field }) => {
                          return (
                            <TextField
                              label="City"
                              autoComplete="off"
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              error={errors.city?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '50%' }}>
                      <Controller
                        control={control}
                        name="state"
                        render={({ field }) => {
                          return (
                            <TextField
                              label="State / province"
                              autoComplete="off"
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              error={errors.state?.message}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flexBasis: '50%' }}>
                      <Controller
                        control={control}
                        name="zip"
                        render={({ field }) => {
                          return (
                            <TextField
                              label="Zip / postal code"
                              autoComplete="off"
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              error={errors.zip?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '50%' }}>
                      <Controller
                        control={control}
                        name="country"
                        render={({ field }) => {
                          return (
                            <Select
                              label="Country"
                              value={field.value}
                              options={countries.map(({ code, name }) => {
                                return { label: name, value: code };
                              })}
                              placeholder="Select country"
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              error={errors.country?.message}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ height: '300px' }}>
                      <Map
                        mapId="map"
                        defaultZoom={1}
                        defaultCenter={{
                          lat: watch('lat'),
                          lng: watch('lng'),
                        }}
                      >
                        <AdvancedMarker
                          draggable
                          position={{ lat: watch('lat'), lng: watch('lng') }}
                          title="Advanced marker"
                          onDragEnd={(event) => {
                            if (event.latLng) {
                              setValue('lat', event.latLng.lat());
                              setValue('lng', event.latLng.lng());
                            }
                          }}
                        />
                      </Map>
                    </div>
                    <Text as="p" tone="subdued">
                      Hint: you can drag the marker to adjust the
                      location&apos;s position on the map
                    </Text>
                  </div>
                </FormLayout>
              </Layout.Section>
            </Layout>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <Layout>
              <Layout.Section>
                <Text as="h2" variant="headingMd">
                  Search filters
                </Text>
              </Layout.Section>
            </Layout>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <Layout>
              <Layout.Section>
                <Text as="h2" variant="headingMd">
                  Custom fields
                </Text>
              </Layout.Section>
            </Layout>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};
