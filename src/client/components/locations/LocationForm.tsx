import { toast } from '@/client/lib/toast';
import {
  CustomAction,
  CustomField,
  LocationsCreateInput,
  SearchFilter,
} from '@/dto/trpc';
import { trpc } from '@/lib/trpc';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonGroup,
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
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { debounce } from 'lodash';
import { Modal } from '../Modal';
import { SearchFilters } from './SearchFilters';
import { CustomFieldValues } from './CustomFieldValues';
import { CustomActionValues } from './CustomActionValues';

const geocodingCache: Record<string, { lat: number; lng: number }> = {};

export interface LocationFormProps {
  mode: 'create' | 'edit';
  defaultFormValues: LocationsCreateInput;
  searchFilters: SearchFilter[];
  customFields: CustomField[];
  customActions: CustomAction[];
}

export const LocationForm: React.FC<LocationFormProps> = ({
  mode,
  defaultFormValues,
  searchFilters,
  customFields,
  customActions,
}) => {
  const utils = trpc.useUtils();
  const router = useRouter();
  const [state, setState] = useState({
    deleteModalOpen: false,
  });
  const map = useMap();
  const placesLibrary = useMapsLibrary('places');
  const geocodingLibrary = useMapsLibrary('geocoding');
  const locationsCreateMutation = trpc.locations.create.useMutation();
  const locationsUpdateMutation = trpc.locations.update.useMutation();
  const locationsDeleteMutation = trpc.locations.delete.useMutation();
  const autocompleteContainerRef = useRef<HTMLDivElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
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
      const stateCode =
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
      setValue('state', stateCode);
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
        router.push(`/locations/${data.id}/edit`).catch((err) => {
          Sentry.captureException(err);
        });
      } else if (mode === 'edit') {
        const result = await locationsUpdateMutation.mutateAsync(data);
        reset({
          ...result.location,
          searchFilters: result.location.searchFilters.map((sf) => sf.id),
        });
      }

      await Promise.all([
        utils.locations.getAll.invalidate(),
        utils.locations.getById.invalidate(),
      ]);
      toast('success', 'Location saved');
    } catch (err) {
      // Shouldn't error here
      toast('error', 'Failed to save location');
      Sentry.captureException(err);
    }
  };
  const debouncedGeocoding = debounce(async () => {
    if (!geocodingLibrary) {
      return;
    }
    const address = `${watch('address1')} ${watch('city')} ${watch('state')} ${watch('zip')} ${watch('country')}`;

    if (!address.trim()) {
      return;
    }

    if (geocodingCache[address]) {
      const { lat, lng } = geocodingCache[address];
      setValue('lat', lat);
      setValue('lng', lng);
      map?.setCenter({ lat, lng });
      map?.setZoom(15);
      return;
    }

    const geocoder = new geocodingLibrary.Geocoder();

    try {
      await geocoder.geocode(
        {
          address,
        },
        (result, status) => {
          if (
            status !== geocodingLibrary.GeocoderStatus.OK ||
            !result ||
            result.length === 0
          ) {
            return;
          }
          const [firstResult] = result;

          const lat = firstResult.geometry.location.lat();
          const lng = firstResult.geometry.location.lng();

          setValue('lat', lat);
          setValue('lng', lng);
          map?.setCenter({ lat, lng });
          map?.setZoom(15);

          geocodingCache[address] = { lat, lng };
        },
      );
    } catch (err) {
      // Ignore the errors thrown here because we handle them inside the
      // callback
    }
  }, 1000);

  return (
    <Page
      title={mode === 'create' ? 'Add new location' : 'Edit location'}
      backAction={{
        content: 'Dashboard',
        onAction: () => {
          router.push('/dashboard').catch((err) => {
            Sentry.captureException(err);
          });
        },
      }}
      primaryAction={{
        content: 'Save',
        onAction: () => {
          handleSubmit(onSubmit)().catch((err) => {
            Sentry.captureException(err);
          });
        },
      }}
      secondaryActions={
        mode === 'create'
          ? []
          : [
              {
                content: 'Delete',
                destructive: true,
                onAction: () => {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      deleteModalOpen: true,
                    };
                  });
                },
              },
            ]
      }
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
                            onChange={(value) => {
                              field.onChange(value);
                              debouncedGeocoding()?.catch((err) => {
                                Sentry.captureException(err);
                              });
                            }}
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
                              onChange={(value) => {
                                field.onChange(value);
                                debouncedGeocoding()?.catch((err) => {
                                  Sentry.captureException(err);
                                });
                              }}
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
                              onChange={(value) => {
                                field.onChange(value);
                                debouncedGeocoding()?.catch((err) => {
                                  Sentry.captureException(err);
                                });
                              }}
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
                              onChange={(value) => {
                                field.onChange(value);
                                debouncedGeocoding()?.catch((err) => {
                                  Sentry.captureException(err);
                                });
                              }}
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
                              onChange={(value) => {
                                field.onChange(value);
                                debouncedGeocoding()?.catch((err) => {
                                  Sentry.captureException(err);
                                });
                              }}
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
                        defaultZoom={
                          watch('lat') === 39 && watch('lng') === 34 ? 1 : 15
                        }
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
                      Hint: you can drag the marker to adjust the position on
                      the map
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
              <Layout.Section>
                <Controller
                  control={control}
                  name="searchFilters"
                  render={({ field }) => {
                    return (
                      <SearchFilters
                        searchFilters={searchFilters}
                        selected={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />
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
              <Layout.Section>
                <Controller
                  control={control}
                  name="customFieldValues"
                  render={({ field }) => {
                    return (
                      <CustomFieldValues
                        customFields={customFields}
                        customFieldValues={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />
              </Layout.Section>
            </Layout>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <Layout>
              <Layout.Section>
                <Text as="h2" variant="headingMd">
                  Custom actions
                </Text>
              </Layout.Section>
              <Layout.Section>
                <Controller
                  control={control}
                  name="customActionValues"
                  render={({ field }) => {
                    return (
                      <CustomActionValues
                        customActions={customActions}
                        customActionValues={field.value}
                        onChange={field.onChange}
                      />
                    );
                  }}
                />
              </Layout.Section>
            </Layout>
          </Card>
        </Layout.Section>
      </Layout>
      <Modal
        open={state.deleteModalOpen}
        title="Delete location"
        footer={
          <ButtonGroup>
            <Button
              onClick={() => {
                setState((prevState) => {
                  return {
                    ...prevState,
                    deleteModalOpen: false,
                  };
                });
              }}
            >
              Cancel
            </Button>
            <Button
              tone="critical"
              onClick={async () => {
                try {
                  await locationsDeleteMutation.mutateAsync({
                    id: watch('id'),
                  });
                  await utils.locations.getAll.invalidate();
                  setState((prevState) => {
                    return {
                      ...prevState,
                      deleteModalOpen: false,
                    };
                  });
                  toast(
                    'success',
                    'Location deleted. Redirecting you to the dashboard...',
                  );
                  setTimeout(() => {
                    router.push('/dashboard').catch((err) => {
                      Sentry.captureException(err);
                    });
                  }, 5000);
                } catch (err) {
                  toast('error', 'Failed to delete location');
                  Sentry.captureException(err);
                }
              }}
            >
              Delete
            </Button>
          </ButtonGroup>
        }
        height="fit-content"
        onClose={() => {
          setState((prevState) => {
            return {
              ...prevState,
              deleteModalOpen: false,
            };
          });
        }}
      >
        <p>Are you sure you want to delete this location?</p>
      </Modal>
    </Page>
  );
};
