import {
  CustomActionsSyncInput,
  CustomFieldsSyncInput,
  LanguagesSyncInput,
  SearchFiltersSyncInput,
  TranslationsSyncInput,
} from '@/dto/trpc';
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  FormLayout,
  Layout,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 } from 'uuid';
import * as Sentry from '@sentry/nextjs';
import { Modal } from '../Modal';

const supportedLanguages = [
  { code: 'ar', name: 'Arabic' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'cs', name: 'Czech' },
  { code: 'zh-HK', name: 'Chinese (Hong Kong)' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'da', name: 'Danish' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hi', name: 'Hindi' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'id', name: 'Indonesian' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'nl', name: 'Dutch' },
  { code: 'no', name: 'Norwegian' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portugese' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sv', name: 'Swedish' },
  { code: 'ta', name: 'Tamil' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
].sort((languageA, languageB) => {
  if (languageA.name < languageB.name) {
    return -1;
  }
  if (languageA.name > languageB.name) {
    return 1;
  }
  return 0;
});

const translationTargets = [
  { value: 'directionsLink', label: 'Directions link' },
].sort((targetA, targetB) => {
  if (targetA.label < targetB.label) {
    return -1;
  }
  if (targetA.label > targetB.label) {
    return 1;
  }
  return 0;
});

const FormData = z.object({
  language: LanguagesSyncInput.element,
  translations: TranslationsSyncInput,
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
type FormData = z.infer<typeof FormData>;

interface LanguageProps {
  language: LanguagesSyncInput[number];
  onEdit: () => void;
  onDelete: () => void;
}

const Language: React.FC<LanguageProps> = ({ language, onEdit, onDelete }) => {
  return (
    <div
      style={{
        padding: '12px',
        background: 'rgba(243, 243, 243, 1)',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <Text as="p" fontWeight="bold">
          {supportedLanguages.find((l) => l.code === language.code)?.name || ''}
        </Text>
        {!language.enabled && <Badge tone="new">Disabled</Badge>}
      </div>
      <ButtonGroup>
        <Button onClick={onEdit}>Edit</Button>
        <Button onClick={onDelete} tone="critical">
          Delete
        </Button>
      </ButtonGroup>
    </div>
  );
};

export interface LanguagesProps {
  languages: LanguagesSyncInput;
  translations: TranslationsSyncInput;
  searchFilters: SearchFiltersSyncInput;
  customFields: CustomFieldsSyncInput;
  customActions: CustomActionsSyncInput;
  onChange: ({
    languages,
    translations,
  }: {
    languages: LanguagesSyncInput;
    translations: TranslationsSyncInput;
  }) => void;
}

export const Languages: React.FC<LanguagesProps> = ({
  languages,
  translations,
  searchFilters,
  customFields,
  customActions,
  onChange,
}) => {
  const [state, setState] = useState({
    languageModal: {
      isOpen: false,
      scope: 'add' as 'add' | 'edit',
    },
  });
  const { control, handleSubmit, reset, getValues, setError } =
    useForm<FormData>({
      resolver: zodResolver(FormData),
    });

  const sortedSearchFilters = useMemo(() => {
    return [...searchFilters].sort((searchFilterA, searchFilterB) => {
      return searchFilterA.position - searchFilterB.position;
    });
  }, [searchFilters]);

  const sortedCustomFields = useMemo(() => {
    return [...customFields].sort((customFieldA, customFieldB) => {
      return customFieldA.position - customFieldB.position;
    });
  }, [customFields]);

  const sortedCustomActions = useMemo(() => {
    return [...customActions].sort((customActionA, customActionB) => {
      return customActionA.position - customActionB.position;
    });
  }, [customActions]);

  return (
    <Card>
      <Layout>
        <Layout.Section>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text variant="headingMd" as="h2">
              Languages
            </Text>
            <Button
              disabled={languages.length === supportedLanguages.length}
              onClick={() => {
                const initialLanguage: LanguagesSyncInput[number] = {
                  id: v4(),
                  code: supportedLanguages[0].code,
                  enabled: true,
                  createdAt: new Date(),
                };

                const initialTranslations: TranslationsSyncInput = [];

                // Translation targets are already sorted
                translationTargets.forEach((target) => {
                  initialTranslations.push({
                    id: v4(),
                    languageId: initialLanguage.id,
                    value: '',
                    target: target.value,
                    searchFilterId: null,
                    customFieldId: null,
                    customActionId: null,
                  });
                });

                sortedSearchFilters.forEach((searchFilter) => {
                  initialTranslations.push({
                    id: v4(),
                    languageId: initialLanguage.id,
                    value: '',
                    target: null,
                    searchFilterId: searchFilter.id,
                    customFieldId: null,
                    customActionId: null,
                  });
                });

                sortedCustomFields.forEach((customField) => {
                  initialTranslations.push({
                    id: v4(),
                    languageId: initialLanguage.id,
                    value: '',
                    target: null,
                    searchFilterId: null,
                    customFieldId: customField.id,
                    customActionId: null,
                  });
                });

                sortedCustomActions.forEach((customAction) => {
                  initialTranslations.push({
                    id: v4(),
                    languageId: initialLanguage.id,
                    value: '',
                    target: null,
                    searchFilterId: null,
                    customFieldId: null,
                    customActionId: customAction.id,
                  });
                });

                reset({
                  language: initialLanguage,
                  translations: initialTranslations,
                });

                setState((prevState) => {
                  return {
                    ...prevState,
                    languageModal: {
                      ...prevState.languageModal,
                      isOpen: true,
                      scope: 'add',
                    },
                  };
                });
              }}
            >
              Add language
            </Button>
          </div>
        </Layout.Section>
        <Layout.Section>
          <Text as="p">
            Use languages to translate search filters, custom fields and custom
            actions names based on the user&apos;s language.
          </Text>
        </Layout.Section>
        {languages.length > 0 && (
          <Layout.Section>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              {languages.map((language) => {
                return (
                  <Language
                    key={language.id}
                    language={language}
                    onEdit={() => {
                      reset({
                        language,
                        translations: translations.filter(
                          (t) => t.languageId === language.id,
                        ),
                      });
                      setState((prevState) => {
                        return {
                          ...prevState,
                          languageModal: {
                            ...prevState.languageModal,
                            isOpen: true,
                            scope: 'edit',
                          },
                        };
                      });
                    }}
                    onDelete={() => {
                      onChange({
                        languages: languages.filter(
                          (l) => l.id !== language.id,
                        ),
                        translations: translations.filter(
                          (t) => t.languageId !== language.id,
                        ),
                      });
                    }}
                  />
                );
              })}
            </div>
          </Layout.Section>
        )}
      </Layout>
      <Modal
        open={state.languageModal.isOpen}
        title={
          state.languageModal.scope === 'add' ? 'Add language' : 'Edit language'
        }
        maxWidth="500px"
        height="fit-content"
        footer={
          <ButtonGroup>
            <Button
              onClick={() => {
                setState((prevState) => {
                  return {
                    ...prevState,
                    languageModal: {
                      ...prevState.languageModal,
                      isOpen: false,
                    },
                  };
                });
              }}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                handleSubmit((data) => {
                  const existingLanguage = languages.find(
                    (language) => language.code === getValues().language.code,
                  );

                  if (
                    existingLanguage &&
                    existingLanguage.id !== getValues().language.id
                  ) {
                    setError('language.code', {
                      message: 'This language has already been added',
                    });
                    return;
                  }

                  if (state.languageModal.scope === 'add') {
                    onChange({
                      languages: [...languages, data.language],
                      translations: [...translations, ...data.translations],
                    });
                  } else {
                    onChange({
                      languages: languages.map((language) => {
                        if (language.id !== data.language.id) {
                          return language;
                        }
                        return data.language;
                      }),
                      translations: [
                        ...translations.filter(
                          (t) => t.languageId !== data.language.id,
                        ),
                        ...data.translations,
                      ],
                    });
                  }

                  setState((prevState) => {
                    return {
                      ...prevState,
                      languageModal: {
                        ...prevState.languageModal,
                        isOpen: false,
                      },
                    };
                  });
                })().catch((err) => {
                  Sentry.captureException(err);
                });
              }}
            >
              {state.languageModal.scope === 'add'
                ? 'Add language'
                : 'Update language'}
            </Button>
          </ButtonGroup>
        }
        onClose={() => {
          setState((prevState) => {
            return {
              ...prevState,
              languageModal: {
                ...prevState.languageModal,
                isOpen: false,
              },
            };
          });
        }}
      >
        <form>
          <FormLayout>
            <Controller
              control={control}
              name="language.code"
              render={({ field, fieldState }) => {
                return (
                  <Select
                    label="Language"
                    value={field.value}
                    options={supportedLanguages.map((language) => {
                      return { label: language.name, value: language.code };
                    })}
                    error={fieldState.error?.message}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                  />
                );
              }}
            />
            <Controller
              control={control}
              name="language.enabled"
              render={({ field }) => {
                return (
                  <Checkbox
                    label="Enabled"
                    checked={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                    }}
                  />
                );
              }}
            />
            <Controller
              control={control}
              name="translations"
              render={({ field }) => {
                const targetTranslations = field.value
                  .filter((translation) => {
                    return translation.target !== null;
                  })
                  .map((translation) => {
                    const target = translationTargets.find(
                      (t) => t.value === translation.target,
                    );
                    if (!target) {
                      return null;
                    }
                    return { translation, target };
                  })
                  .filter((v) => {
                    return v !== null;
                  })
                  .sort((a, b) => {
                    if (a.target.label < b.target.label) {
                      return -1;
                    }
                    if (a.target.label > b.target.label) {
                      return 1;
                    }
                    return 0;
                  });
                const searchFilterTranslations = field.value
                  .filter((translation) => {
                    return translation.searchFilterId !== null;
                  })
                  .map((translation) => {
                    const searchFilter = searchFilters.find(
                      (sf) => sf.id === translation.searchFilterId,
                    );

                    if (!searchFilter) {
                      return null;
                    }

                    return { translation, searchFilter };
                  })
                  .filter((v) => {
                    return v !== null;
                  })
                  .sort((a, b) => {
                    return a.searchFilter.position - b.searchFilter.position;
                  });
                const customFieldTranslations = field.value
                  .filter((translation) => {
                    return translation.customFieldId !== null;
                  })
                  .map((translation) => {
                    const customField = customFields.find(
                      (cf) => cf.id === translation.customFieldId,
                    );

                    if (!customField) {
                      return null;
                    }

                    return { translation, customField };
                  })
                  .filter((v) => {
                    return v !== null;
                  })
                  .sort((a, b) => {
                    return a.customField.position - b.customField.position;
                  });
                const customActionTranslations = field.value
                  .filter((translation) => {
                    return translation.customActionId !== null;
                  })
                  .map((translation) => {
                    const customAction = customActions.find(
                      (ca) => ca.id === translation.customActionId,
                    );

                    if (!customAction) {
                      return null;
                    }

                    return { translation, customAction };
                  })
                  .filter((v) => {
                    return v !== null;
                  })
                  .sort((a, b) => {
                    return a.customAction.position - b.customAction.position;
                  });

                return (
                  <FormLayout>
                    <Text variant="headingMd" as="h2">
                      General
                    </Text>
                    {targetTranslations.map((v) => {
                      return (
                        <TextField
                          key={v.translation.id}
                          autoComplete="off"
                          label={v.target.label}
                          value={v.translation.value}
                          onChange={(value) => {
                            const updatedTranslations = field.value.map(
                              (translation) => {
                                if (translation.id !== v.translation.id) {
                                  return translation;
                                }
                                return { ...translation, value };
                              },
                            );
                            field.onChange(updatedTranslations);
                          }}
                        />
                      );
                    })}
                    <Text variant="headingMd" as="h2">
                      Search filters
                    </Text>
                    {searchFilterTranslations.map((v) => {
                      return (
                        <TextField
                          key={v.translation.id}
                          autoComplete="off"
                          label={v.searchFilter.name}
                          value={v.translation.value}
                          onChange={(value) => {
                            const updatedTranslations = field.value.map(
                              (translation) => {
                                if (translation.id !== v.translation.id) {
                                  return translation;
                                }
                                return { ...translation, value };
                              },
                            );
                            field.onChange(updatedTranslations);
                          }}
                        />
                      );
                    })}
                    <Text variant="headingMd" as="h2">
                      Custom fields
                    </Text>
                    {customFieldTranslations.map((v) => {
                      return (
                        <TextField
                          key={v.translation.id}
                          autoComplete="off"
                          label={v.customField.name}
                          value={v.translation.value}
                          onChange={(value) => {
                            const updatedTranslations = field.value.map(
                              (translation) => {
                                if (translation.id !== v.translation.id) {
                                  return translation;
                                }
                                return { ...translation, value };
                              },
                            );
                            field.onChange(updatedTranslations);
                          }}
                        />
                      );
                    })}
                    <Text variant="headingMd" as="h2">
                      Custom actions
                    </Text>
                    {customActionTranslations.map((v) => {
                      return (
                        <TextField
                          key={v.translation.id}
                          autoComplete="off"
                          label={v.customAction.name}
                          value={v.translation.value}
                          onChange={(value) => {
                            const updatedTranslations = field.value.map(
                              (translation) => {
                                if (translation.id !== v.translation.id) {
                                  return translation;
                                }
                                return { ...translation, value };
                              },
                            );
                            field.onChange(updatedTranslations);
                          }}
                        />
                      );
                    })}
                  </FormLayout>
                );
              }}
            />
          </FormLayout>
        </form>
      </Modal>
    </Card>
  );
};
