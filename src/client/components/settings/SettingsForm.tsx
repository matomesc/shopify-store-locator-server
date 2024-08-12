import {
  Button,
  Card,
  FormLayout,
  Layout,
  Page,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import { useEffect, useState } from 'react';
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
import { timezones } from '@/lib/timezones';
import { z } from 'zod';
import { v4 } from 'uuid';
import { PlansModal } from '../billing/PlansModal';
import { SearchFilters } from './SearchFilters';
import { CustomFields } from './CustomFields';
import { CustomActions } from './CustomActions';
import { Languages } from './Languages';

export const FormData = z.object({
  settings: SettingsUpdateInput,
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
  const customFieldsSyncMutation = trpc.customFields.sync.useMutation();
  const customActionsSyncMutation = trpc.customActions.sync.useMutation();
  const languagesSyncMutation = trpc.languages.sync.useMutation();
  const translationsSyncMutation = trpc.translations.sync.useMutation();
  const {
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
    watch,
    getValues,
    setValue,
  } = useForm({
    resolver: zodResolver(FormData),
    defaultValues: defaultFormValues,
  });
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const [
        settingsResult,
        searchFiltersResult,
        customFieldResult,
        customActionsResult,
        languagesResult,
      ] = await Promise.all([
        settingsUpdateMutation.mutateAsync({
          googleMapsApiKey: data.settings.googleMapsApiKey,
          timezone: data.settings.timezone,
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
        settings: settingsResult.settings,
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
        <Layout.Section>
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
                    render={({ field }) => {
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
                          error={errors.settings?.timezone?.message}
                          helpText="This is used for analytics to display data in your timezone. Choose the location closest to you."
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
        </Layout.Section>

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
