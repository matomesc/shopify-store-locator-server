import { CustomFieldLabelPosition, CustomFieldsSyncInput } from '@/dto/trpc';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { ArrowDownIcon, ArrowUpIcon } from '@shopify/polaris-icons';
import { useMemo, useState } from 'react';
import {
  Controller,
  useForm,
  FormProvider,
  useFormContext,
} from 'react-hook-form';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { v4 } from 'uuid';
import { Modal } from '../Modal';
import { Editor } from '../customFieldValues/Editor';

const FormData = CustomFieldsSyncInput.element;
// eslint-disable-next-line @typescript-eslint/no-redeclare
type FormData = z.infer<typeof FormData>;

interface CustomFieldFormProps {}

const CustomFieldForm: React.FC<CustomFieldFormProps> = () => {
  const { control, watch } = useFormContext<FormData>();

  return (
    <form>
      <FormLayout>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => {
            return (
              <TextField
                label="Name"
                autoComplete="off"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            );
          }}
        />

        <Controller
          control={control}
          name="enabled"
          render={({ field }) => {
            return (
              <Checkbox
                label="Enabled"
                checked={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <Controller
          control={control}
          name="hideLabel"
          render={({ field }) => {
            return (
              <Checkbox
                label="Hide label"
                checked={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        {!watch('hideLabel') && (
          <Controller
            control={control}
            name="labelPosition"
            render={({ field, fieldState }) => {
              return (
                <Select
                  label="Label position"
                  options={[
                    {
                      label: 'Top',
                      value: CustomFieldLabelPosition.Enum.top,
                    },
                    {
                      label: 'Inline',
                      value: CustomFieldLabelPosition.Enum.inline,
                    },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              );
            }}
          />
        )}

        <Controller
          control={control}
          name="showInList"
          render={({ field }) => {
            return (
              <Checkbox
                label="Show in list"
                checked={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <Controller
          control={control}
          name="showInMap"
          render={({ field }) => {
            return (
              <Checkbox
                label="Show in map"
                checked={field.value}
                onChange={field.onChange}
              />
            );
          }}
        />

        <Controller
          control={control}
          name="defaultValue"
          render={({ field, fieldState }) => {
            return (
              <Editor
                label="Default value"
                value={field.value}
                onChange={field.onChange}
                height={100}
                error={fieldState.error?.message}
              />
            );
          }}
        />
      </FormLayout>
    </form>
  );
};

interface CustomFieldProps {
  customField: CustomFieldsSyncInput[number];
  onDelete: () => void;
  onEdit: () => void;
  onUp: () => void;
  onDown: () => void;
}

const CustomField: React.FC<CustomFieldProps> = ({
  customField,
  onEdit,
  onDelete,
  onUp,
  onDown,
}) => {
  return (
    <div
      style={{
        padding: '12px',
        background: 'rgba(243, 243, 243, 1)',
        borderRadius: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Text as="p" fontWeight="bold">
            {customField.name}
          </Text>
          {!customField.enabled && <Badge tone="new">Disabled</Badge>}
        </div>
        <ButtonGroup>
          <Button icon={ArrowUpIcon} onClick={onUp} />
          <Button icon={ArrowDownIcon} onClick={onDown} />
          <Button onClick={onEdit}>Edit</Button>
          <Button tone="critical" onClick={onDelete}>
            Delete
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};

export interface CustomFieldsProps {
  customFields: CustomFieldsSyncInput;
  onChange: (value: CustomFieldsSyncInput) => void;
}

export const CustomFields: React.FC<CustomFieldsProps> = ({
  customFields,
  onChange,
}) => {
  const [state, setState] = useState({
    customFieldModal: {
      isOpen: false,
      scope: 'add' as 'add' | 'edit',
    },
  });
  const formMethods = useForm<FormData>({
    resolver: zodResolver(FormData),
    defaultValues: {
      id: v4(),
      name: '',
      position: 0,
      hideLabel: false,
      labelPosition: 'top',
      showInList: true,
      showInMap: true,
      defaultValue: '',
    },
  });
  const sortedCustomFields = useMemo(() => {
    return [...customFields].sort((customFieldA, customFieldB) => {
      return customFieldA.position - customFieldB.position;
    });
  }, [customFields]);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
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
                Custom fields
              </Text>
              <Button
                onClick={() => {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      customFieldModal: {
                        ...prevState.customFieldModal,
                        isOpen: true,
                        scope: 'add',
                      },
                    };
                  });
                  formMethods.reset({
                    id: v4(),
                    name: '',
                    position: sortedCustomFields.length,
                    enabled: true,
                    hideLabel: false,
                    labelPosition: 'top',
                    showInList: true,
                    showInMap: true,
                    defaultValue: '',
                  });
                }}
              >
                Add custom field
              </Button>
            </div>
          </Layout.Section>
          <Layout.Section>
            <Text as="p">
              Use custom fields to add custom data to each location.
            </Text>
          </Layout.Section>
          {sortedCustomFields.length > 0 && (
            <Layout.Section>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {sortedCustomFields.map((customField, index) => {
                  return (
                    <CustomField
                      key={customField.id}
                      customField={customField}
                      onEdit={() => {
                        setState((prevState) => {
                          return {
                            ...prevState,
                            customFieldModal: {
                              ...prevState.customFieldModal,
                              isOpen: true,
                              scope: 'edit',
                            },
                          };
                        });
                        formMethods.reset(customField);
                      }}
                      onDelete={() => {
                        // Get the remaining custom fields by filtering out the
                        // custom field to delete and then readjust the positions
                        // based on their location in the array.
                        const remainingCustomFields = sortedCustomFields
                          .filter((cf) => cf.id !== customField.id)
                          .map((cf, idx) => {
                            return {
                              ...cf,
                              position: idx,
                            };
                          });
                        onChange(remainingCustomFields);
                      }}
                      onUp={() => {
                        if (index === 0) {
                          // Can't move up
                          return;
                        }
                        const sourceValue = customField;
                        const sourcePosition = customField.position;
                        const destIndex = index - 1;
                        const destValue = sortedCustomFields[destIndex];
                        const destPosition = destValue.position;

                        onChange(
                          sortedCustomFields.map((sf) => {
                            if (sf.id === sourceValue.id) {
                              return {
                                ...sourceValue,
                                position: destPosition,
                              };
                            }
                            if (sf.id === destValue.id) {
                              return {
                                ...destValue,
                                position: sourcePosition,
                              };
                            }
                            return sf;
                          }),
                        );
                      }}
                      onDown={() => {
                        if (index === sortedCustomFields.length - 1) {
                          // Can't move down
                          return;
                        }
                        const sourceValue = customField;
                        const sourcePosition = customField.position;
                        const destIndex = index + 1;
                        const destValue = sortedCustomFields[destIndex];
                        const destPosition = destValue.position;

                        onChange(
                          sortedCustomFields.map((sf) => {
                            if (sf.id === sourceValue.id) {
                              return {
                                ...sourceValue,
                                position: destPosition,
                              };
                            }
                            if (sf.id === destValue.id) {
                              return {
                                ...destValue,
                                position: sourcePosition,
                              };
                            }
                            return sf;
                          }),
                        );
                      }}
                    />
                  );
                })}
              </div>
            </Layout.Section>
          )}
        </Layout>
        <Modal
          title={
            state.customFieldModal.scope === 'add'
              ? 'Add custom field'
              : 'Edit custom field'
          }
          open={state.customFieldModal.isOpen}
          height="fit-content"
          maxWidth="500px"
          footer={
            <ButtonGroup>
              <Button
                onClick={() => {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      customFieldModal: {
                        ...prevState.customFieldModal,
                        isOpen: false,
                      },
                    };
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  formMethods
                    .handleSubmit((data) => {
                      const customFieldWithSameName = sortedCustomFields.find(
                        (cf) => cf.name === formMethods.getValues().name,
                      );

                      if (
                        customFieldWithSameName &&
                        customFieldWithSameName.id !==
                          formMethods.getValues().id
                      ) {
                        formMethods.setError('name', {
                          message:
                            'A custom field with this name already exists',
                        });
                        return;
                      }

                      if (state.customFieldModal.scope === 'add') {
                        onChange([...sortedCustomFields, data]);
                      } else {
                        onChange(
                          sortedCustomFields.map((customField) => {
                            if (customField.id === data.id) {
                              return {
                                ...data,
                              };
                            }
                            return customField;
                          }),
                        );
                      }
                      setState((prevState) => {
                        return {
                          ...prevState,
                          customFieldModal: {
                            ...prevState.customFieldModal,
                            isOpen: false,
                          },
                        };
                      });
                    })()
                    .catch((err) => {
                      Sentry.captureException(err);
                    });
                }}
              >
                {state.customFieldModal.scope === 'add'
                  ? 'Add custom field'
                  : 'Update custom field'}
              </Button>
            </ButtonGroup>
          }
          onClose={() => {
            setState((prevState) => {
              return {
                ...prevState,
                customFieldModal: {
                  ...prevState.customFieldModal,
                  isOpen: false,
                },
              };
            });
          }}
        >
          <CustomFieldForm />
        </Modal>
      </Card>
    </FormProvider>
  );
};
