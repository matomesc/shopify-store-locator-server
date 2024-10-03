import {
  Card,
  FormLayout,
  Layout,
  Page,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import { useEffect } from 'react';
import {
  CustomActionsSyncInput,
  CustomFieldsSyncInput,
  LanguagesSyncInput,
  Plan,
  SearchFiltersSyncInput,
  SettingsUpdateInput,
  Shop,
  TranslationsSyncInput,
} from '@/dto/trpc';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Sentry from '@sentry/nextjs';
import { trpc } from '@/lib/trpc';
import { toast } from '@/client/lib/toast';
import { z } from 'zod';
import { v4 } from 'uuid';
import { SearchFilters } from './SearchFilters';
import { CustomFields } from './CustomFields';
import { CustomActions } from './CustomActions';
import { Languages } from './Languages';
import { ColorPicker } from './ColorPicker';
import { ImageUpload } from './ImageUpload';

export const FormData = z.object({
  settings: SettingsUpdateInput.omit({ borderRadius: true }).merge(
    z.object({
      borderRadius: z
        .string()
        .min(1)
        .max(98)
        .regex(/^\d+(\.\d+)?$/, 'Value must be a number'),
    }),
  ),
  searchFilters: SearchFiltersSyncInput,
  customFields: CustomFieldsSyncInput,
  customActions: CustomActionsSyncInput,
  languages: LanguagesSyncInput,
  translations: TranslationsSyncInput,
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type FormData = z.infer<typeof FormData>;

export interface SettingsFormProps {
  shop: Shop;
  plans: Plan[];
  defaultFormValues: FormData;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  // shop,
  // plans,
  defaultFormValues,
}) => {
  const utils = trpc.useUtils();
  // const [state, setState] = useState({
  //   plansModalOpen: false,
  // });
  const settingsUpdateMutation = trpc.settings.update.useMutation();
  const searchFiltersSyncMutation = trpc.searchFilters.sync.useMutation();
  const customFieldsSyncMutation = trpc.customFields.sync.useMutation();
  const customActionsSyncMutation = trpc.customActions.sync.useMutation();
  const languagesSyncMutation = trpc.languages.sync.useMutation();
  const translationsSyncMutation = trpc.translations.sync.useMutation();
  const {
    handleSubmit,
    control,
    formState: { isDirty },
    reset,
    watch,
    getValues,
    setValue,
    setError,
  } = useForm({
    resolver: zodResolver(FormData),
    defaultValues: {
      ...defaultFormValues,
      settings: {
        ...defaultFormValues.settings,
        borderRadius: defaultFormValues.settings.borderRadius.replace('px', ''),
      },
    },
  });
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    // TODO remove this when zod v4 drops and replace it with a refine on the
    // setting schema. See this issue
    // https://github.com/neuteklabs/neutek-locator/issues/19.
    if (
      data.settings.mapMarkerType === 'image' &&
      !data.settings.mapMarkerImage
    ) {
      setError('settings.mapMarkerImage', { message: 'Image is required' });
      return;
    }

    try {
      const [
        settingsResult,
        searchFiltersResult,
        customFieldResult,
        customActionsResult,
        languagesResult,
      ] = await Promise.all([
        settingsUpdateMutation.mutateAsync({
          ...data.settings,
          borderRadius: `${data.settings.borderRadius}px`,
        }),
        searchFiltersSyncMutation.mutateAsync(data.searchFilters),
        customFieldsSyncMutation.mutateAsync(data.customFields),
        customActionsSyncMutation.mutateAsync(data.customActions),
        languagesSyncMutation.mutateAsync(data.languages),
      ]);

      // Save translations after languages have been saved
      const translationsResult = await translationsSyncMutation.mutateAsync(
        data.translations,
      );

      reset({
        settings: {
          ...settingsResult.settings,
          borderRadius: settingsResult.settings.borderRadius.replace('px', ''),
        },
        searchFilters: searchFiltersResult.searchFilters,
        customFields: customFieldResult.customFields,
        customActions: customActionsResult.customActions,
        languages: languagesResult.languages,
        translations: translationsResult.translations,
      });

      await Promise.all([
        utils.settings.get.invalidate(),
        utils.searchFilters.getAll.invalidate(),
        utils.customFields.getAll.invalidate(),
        utils.customActions.getAll.invalidate(),
        utils.languages.getAll.invalidate(),
        utils.translations.getAll.invalidate(),
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
        {/* <Layout.Section>
          <Card>
            <Layout>
              <Layout.Section>
                <Text variant="headingMd" as="h2">
                  General
                </Text>
              </Layout.Section>
              <Layout.Section>
                <FormLayout>
                  <Controller
                    control={control}
                    name="settings.timezone"
                    render={({ field, fieldState }) => {
                      return (
                        <Select
                          label="Timezone"
                          options={timezones.map((tz) => {
                            return {
                              label: tz,
                              value: tz,
                            };
                          })}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={fieldState.error?.message}
                          helpText="This is used for analytics to display data in your timezone. Choose the location closest to you."
                        />
                      );
                    }}
                  />
                </FormLayout>
              </Layout.Section>
            </Layout>
          </Card>
        </Layout.Section> */}

        {/* <Layout.Section>
          <Card>
            <Layout>
              <Layout.Section>
                <Text variant="headingMd" as="h2">
                  Billing
                </Text>
              </Layout.Section>
              <Layout.Section>
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
              </Layout.Section>
            </Layout>
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
        </Layout.Section> */}

        <Layout.Section>
          <Card>
            <Layout>
              <Layout.Section>
                <Text variant="headingMd" as="h2">
                  Google Maps
                </Text>
              </Layout.Section>
              <Layout.Section>
                <Controller
                  control={control}
                  name="settings.googleMapsApiKey"
                  render={({ field, fieldState }) => {
                    return (
                      <TextField
                        autoComplete="off"
                        label="Google Maps API key"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={fieldState.error?.message}
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
                <Text variant="headingMd" as="h2">
                  Appearance
                </Text>
              </Layout.Section>
              <Layout.Section>
                <Text as="p">Customize the look and feel of the locator.</Text>
              </Layout.Section>
              <Layout.Section>
                <FormLayout>
                  <Text variant="headingSm" as="h3">
                    General
                  </Text>
                  <div
                    style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                  >
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.borderRadius"
                        render={({ field, fieldState }) => {
                          return (
                            <TextField
                              autoComplete="off"
                              label="Border radius"
                              suffix="px"
                              value={field.value}
                              error={fieldState.error?.message}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                </FormLayout>
              </Layout.Section>
              <Layout.Section>
                <FormLayout>
                  <Text variant="headingSm" as="h3">
                    Search
                  </Text>
                  <div
                    style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                  >
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.searchInputBorderColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Input border color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.searchInputBackgroundColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Input background color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.searchInputPlaceholderColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Input placeholder color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                  >
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.searchButtonTextColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Button text color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.searchButtonBackgroundColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Button background color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.searchButtonHoverBackgroundColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Button hover background color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                </FormLayout>
              </Layout.Section>
              <Layout.Section>
                <FormLayout>
                  <Text variant="headingSm" as="h3">
                    Search filters
                  </Text>
                  <div
                    style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                  >
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.searchFilterTextColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Text color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.searchFilterBackgroundColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Background color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.searchFilterHoverBackgroundColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Hover background color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                  >
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.searchFilterSelectedBorderColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Selected border color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.searchFilterSelectedBackgroundColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Selected background color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.searchFilterSelectedHoverBackgroundColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Selected and hover background color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                </FormLayout>
              </Layout.Section>
              <Layout.Section>
                <FormLayout>
                  <Text variant="headingSm" as="h3">
                    List
                  </Text>
                  <div
                    style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                  >
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.listLocationNameColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Location name color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.listTextColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Text color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.listLinkColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Link color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                  >
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.listSearchFilterColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Search filter color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.listCustomActionTextColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Custom action text color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.listCustomActionBackgroundColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Custom action background color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                  >
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.listCustomActionHoverBackgroundColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Custom action hover background color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.listSelectedLocationBorderColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Selected location border color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.listPinAndDistanceColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Pin and distance color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                </FormLayout>
              </Layout.Section>
              <Layout.Section>
                <FormLayout>
                  <Text variant="headingSm" as="h3">
                    Map
                  </Text>
                  <div
                    style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                  >
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.mapMarkerType"
                        render={({ field, fieldState }) => {
                          return (
                            <Select
                              label="Marker type"
                              value={field.value}
                              options={[
                                { label: 'Pin', value: 'pin' },
                                { label: 'Image', value: 'image' },
                              ]}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                  {watch('settings.mapMarkerType') === 'pin' && (
                    <div
                      style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                    >
                      <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                        <Controller
                          control={control}
                          name="settings.mapMarkerBackgroundColor"
                          render={({ field, fieldState }) => {
                            return (
                              <ColorPicker
                                label="Marker background color"
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                              />
                            );
                          }}
                        />
                      </div>
                      <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                        <Controller
                          control={control}
                          name="settings.mapMarkerBorderColor"
                          render={({ field, fieldState }) => {
                            return (
                              <ColorPicker
                                label="Marker border color"
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                              />
                            );
                          }}
                        />
                      </div>
                      <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                        <Controller
                          control={control}
                          name="settings.mapMarkerGlyphColor"
                          render={({ field, fieldState }) => {
                            return (
                              <ColorPicker
                                label="Marker glyph color"
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                              />
                            );
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {watch('settings.mapMarkerType') === 'image' && (
                    <Controller
                      control={control}
                      name="settings.mapMarkerImage"
                      render={({ field, fieldState }) => {
                        return (
                          <ImageUpload
                            label="Marker image"
                            value={field.value}
                            onChange={field.onChange}
                            error={fieldState.error?.message}
                          />
                        );
                      }}
                    />
                  )}
                  <div
                    style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                  >
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.mapLocationNameColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Location name color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.mapTextColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Text color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.mapLinkColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Link color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                  >
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.mapSearchFilterColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Search filter color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.mapCustomActionTextColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Custom action text color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.mapCustomActionBackgroundColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Custom action background color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
                  >
                    <div style={{ flexBasis: '32%', minWidth: '130px' }}>
                      <Controller
                        control={control}
                        name="settings.mapCustomActionHoverBackgroundColor"
                        render={({ field, fieldState }) => {
                          return (
                            <ColorPicker
                              label="Custom action hover background color"
                              value={field.value}
                              onChange={field.onChange}
                              error={fieldState.error?.message}
                            />
                          );
                        }}
                      />
                    </div>
                  </div>
                </FormLayout>
              </Layout.Section>
            </Layout>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Controller
            control={control}
            name="searchFilters"
            render={({ field }) => {
              return (
                <SearchFilters
                  searchFilters={field.value}
                  onChange={(searchFilters) => {
                    field.onChange(searchFilters);

                    const searchFilterIds = searchFilters.map((sf) => sf.id);
                    const { languages, translations } = getValues();
                    const newTranslations: typeof translations = [];

                    languages.forEach((language) => {
                      let languageTranslations = translations.filter(
                        (t) => t.languageId === language.id,
                      );

                      searchFilterIds.forEach((searchFilterId) => {
                        const translation = languageTranslations.find(
                          (t) => t.searchFilterId === searchFilterId,
                        );

                        if (!translation) {
                          languageTranslations.push({
                            id: v4(),
                            languageId: language.id,
                            value: '',
                            target: null,
                            searchFilterId,
                            customFieldId: null,
                            customActionId: null,
                          });
                        }
                      });

                      languageTranslations = languageTranslations.filter(
                        (translation) => {
                          return (
                            translation.searchFilterId === null ||
                            searchFilterIds.includes(translation.searchFilterId)
                          );
                        },
                      );

                      newTranslations.push(...languageTranslations);
                    });

                    setValue('translations', newTranslations);
                  }}
                />
              );
            }}
          />
        </Layout.Section>

        <Layout.Section>
          <Controller
            control={control}
            name="customFields"
            render={({ field }) => {
              return (
                <CustomFields
                  customFields={field.value}
                  onChange={(customFields) => {
                    field.onChange(customFields);

                    const customFieldIds = customFields.map((cf) => cf.id);
                    const { languages, translations } = getValues();
                    const newTranslations: typeof translations = [];

                    languages.forEach((language) => {
                      let languageTranslations = translations.filter(
                        (t) => t.languageId === language.id,
                      );

                      customFieldIds.forEach((customFieldId) => {
                        const translation = languageTranslations.find(
                          (t) => t.customFieldId === customFieldId,
                        );

                        if (!translation) {
                          languageTranslations.push({
                            id: v4(),
                            languageId: language.id,
                            value: '',
                            target: null,
                            searchFilterId: null,
                            customFieldId,
                            customActionId: null,
                          });
                        }
                      });

                      languageTranslations = languageTranslations.filter(
                        (translation) => {
                          return (
                            translation.customFieldId === null ||
                            customFieldIds.includes(translation.customFieldId)
                          );
                        },
                      );

                      newTranslations.push(...languageTranslations);
                    });

                    setValue('translations', newTranslations);
                  }}
                />
              );
            }}
          />
        </Layout.Section>

        <Layout.Section>
          <Controller
            control={control}
            name="customActions"
            render={({ field }) => {
              return (
                <CustomActions
                  customActions={field.value}
                  onChange={(customActions) => {
                    field.onChange(customActions);

                    const customActionIds = customActions.map((ca) => ca.id);
                    const { languages, translations } = getValues();
                    const newTranslations: typeof translations = [];

                    languages.forEach((language) => {
                      let languageTranslations = translations.filter(
                        (t) => t.languageId === language.id,
                      );

                      customActionIds.forEach((customActionId) => {
                        const translation = languageTranslations.find(
                          (t) => t.customActionId === customActionId,
                        );

                        if (!translation) {
                          languageTranslations.push({
                            id: v4(),
                            languageId: language.id,
                            value: '',
                            target: null,
                            searchFilterId: null,
                            customFieldId: null,
                            customActionId,
                          });
                        }
                      });

                      languageTranslations = languageTranslations.filter(
                        (translation) => {
                          return (
                            translation.customActionId === null ||
                            customActionIds.includes(translation.customActionId)
                          );
                        },
                      );

                      newTranslations.push(...languageTranslations);
                    });

                    setValue('translations', newTranslations);
                  }}
                />
              );
            }}
          />
        </Layout.Section>

        <Layout.Section>
          <Controller
            control={control}
            name="languages"
            render={({ field: languagesField }) => {
              return (
                <Controller
                  control={control}
                  name="translations"
                  render={({ field: translationsField }) => {
                    return (
                      <Languages
                        languages={languagesField.value}
                        translations={translationsField.value}
                        searchFilters={watch('searchFilters')}
                        customFields={watch('customFields')}
                        customActions={watch('customActions')}
                        onChange={({ languages, translations }) => {
                          languagesField.onChange(languages);
                          translationsField.onChange(translations);
                        }}
                      />
                    );
                  }}
                />
              );
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
};
