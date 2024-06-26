import { CustomFieldLabelPosition, CustomFieldsSyncInput } from '@/dto/trpc';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonGroup,
  Checkbox,
  FormLayout,
  Labelled,
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
import { Editor } from '../customFieldValue/Editor';

const FormData = CustomFieldsSyncInput.element;
// eslint-disable-next-line @typescript-eslint/no-redeclare
type FormData = z.infer<typeof FormData>;

interface CustomFieldFormProps {}

const CustomFieldForm: React.FC<CustomFieldFormProps> = () => {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<FormData>();

  return (
    <form>
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
                error={errors.name?.message}
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
            render={({ field }) => {
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
                  error={errors.labelPosition?.message}
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
          render={({ field }) => {
            return (
              <Labelled id="" label="Default value">
                <Editor
                  value={field.value}
                  onChange={field.onChange}
                  height={100}
                />
                {errors.defaultValue?.message && (
                  <Text as="p" tone="critical">
                    {errors.defaultValue.message}
                  </Text>
                )}
              </Labelled>
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
        <Text as="p" fontWeight="bold">
          {customField.name}
        </Text>
        <ButtonGroup>
          <Button icon={ArrowUpIcon} onClick={onUp} />
          <Button icon={ArrowDownIcon} onClick={onDown} />
          <Button tone="critical" onClick={onDelete}>
            Delete
          </Button>
          <Button onClick={onEdit}>Edit</Button>
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
    return customFields.sort((customFieldA, customFieldB) => {
      return customFieldA.position - customFieldB.position;
    });
  }, [customFields]);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formMethods}>
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '10px',
          }}
        >
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
        {sortedCustomFields.length === 0 && (
          <div>
            <p>You have no custom fields. Add your first one.</p>
          </div>
        )}
        {sortedCustomFields.length > 0 && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
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
        )}
        <Modal
          title={
            state.customFieldModal.scope === 'add'
              ? 'Add custom field'
              : 'Edit custom field'
          }
          open={state.customFieldModal.isOpen}
          height="fit-content"
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
      </div>
    </FormProvider>
  );
};
