import { CustomActionsSyncInput } from '@/dto/trpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from 'react-hook-form';
import { v4 } from 'uuid';
import { z } from 'zod';
import {
  Badge,
  Button,
  ButtonGroup,
  Checkbox,
  FormLayout,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import { ArrowDownIcon, ArrowUpIcon } from '@shopify/polaris-icons';
import * as Sentry from '@sentry/nextjs';
import { Modal } from '../Modal';

const FormData = CustomActionsSyncInput.element;
// eslint-disable-next-line @typescript-eslint/no-redeclare
type FormData = z.infer<typeof FormData>;

const CustomActionForm: React.FC = () => {
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
                error={errors.name?.message}
                onChange={field.onChange}
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
          name="type"
          render={({ field }) => {
            return (
              <Select
                label="Type"
                value={field.value}
                options={[
                  { label: 'Link', value: 'link' },
                  { label: 'Custom JavaScript', value: 'js' },
                ]}
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
              <TextField
                label={
                  watch('type') === 'js'
                    ? 'Default custom JavaScript'
                    : 'Default URL'
                }
                multiline={watch('type') === 'js' ? 3 : false}
                maxHeight={150}
                autoComplete="off"
                value={field.value}
                onChange={field.onChange}
                placeholder={
                  watch('type') === 'link' ? 'https://example.com' : ''
                }
              />
            );
          }}
        />
        {watch('type') === 'link' && (
          <Controller
            control={control}
            name="openInNewTab"
            render={({ field }) => {
              return (
                <Checkbox
                  label="Open in new tab"
                  checked={field.value}
                  onChange={field.onChange}
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
      </FormLayout>
    </form>
  );
};

interface CustomActionProps {
  customAction: CustomActionsSyncInput[number];
  onDelete: () => void;
  onEdit: () => void;
  onUp: () => void;
  onDown: () => void;
}

const CustomAction: React.FC<CustomActionProps> = ({
  customAction,
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Text as="p" fontWeight="bold">
            {customAction.name}
          </Text>
          {!customAction.enabled && <Badge tone="new">Disabled</Badge>}
          <Badge tone="success">
            {customAction.type === 'js' ? 'JavaScript' : 'Link'}
          </Badge>
        </div>
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

export interface CustomActionsProps {
  customActions: CustomActionsSyncInput;
  onChange: (value: CustomActionsSyncInput) => void;
}

export const CustomActions: React.FC<CustomActionsProps> = ({
  customActions,
  onChange,
}) => {
  const [state, setState] = useState({
    customActionModal: {
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
      showInList: true,
      showInMap: true,
    },
  });
  const sortedCustomActions = useMemo(() => {
    return customActions.sort((customActionA, customActionB) => {
      return customActionA.position - customActionB.position;
    });
  }, [customActions]);

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
                  customActionModal: {
                    ...prevState.customActionModal,
                    isOpen: true,
                    scope: 'add',
                  },
                };
              });
              formMethods.reset({
                id: v4(),
                type: 'link',
                name: '',
                position: sortedCustomActions.length,
                enabled: true,
                showInList: true,
                showInMap: true,
                defaultValue: '',
                openInNewTab: true,
              });
            }}
          >
            Add custom action
          </Button>
        </div>
        {sortedCustomActions.length === 0 && (
          <div>
            <p>You have no custom actions. Add your first one.</p>
          </div>
        )}
        {sortedCustomActions.length > 0 && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            {sortedCustomActions.map((customAction, index) => {
              return (
                <CustomAction
                  key={customAction.id}
                  customAction={customAction}
                  onEdit={() => {
                    setState((prevState) => {
                      return {
                        ...prevState,
                        customActionModal: {
                          ...prevState.customActionModal,
                          isOpen: true,
                          scope: 'edit',
                        },
                      };
                    });
                    formMethods.reset(customAction);
                  }}
                  onDelete={() => {
                    const remainingSearchFilters = sortedCustomActions
                      .filter((ca) => {
                        return ca.id !== customAction.id;
                      })
                      .map((ca, idx) => {
                        return {
                          ...ca,
                          position: idx,
                        };
                      });
                    onChange(remainingSearchFilters);
                  }}
                  onUp={() => {
                    if (index === 0) {
                      // Can't move up
                      return;
                    }
                    const sourceValue = customAction;
                    const sourcePosition = customAction.position;
                    const destIndex = index - 1;
                    const destValue = sortedCustomActions[destIndex];
                    const destPosition = destValue.position;

                    onChange(
                      sortedCustomActions.map((ca) => {
                        if (ca.id === sourceValue.id) {
                          return {
                            ...sourceValue,
                            position: destPosition,
                          };
                        }
                        if (ca.id === destValue.id) {
                          return {
                            ...destValue,
                            position: sourcePosition,
                          };
                        }
                        return ca;
                      }),
                    );
                  }}
                  onDown={() => {
                    if (index === sortedCustomActions.length - 1) {
                      // Can't move down
                      return;
                    }
                    const sourceValue = customAction;
                    const sourcePosition = customAction.position;
                    const destIndex = index + 1;
                    const destValue = sortedCustomActions[destIndex];
                    const destPosition = destValue.position;

                    onChange(
                      sortedCustomActions.map((ca) => {
                        if (ca.id === sourceValue.id) {
                          return {
                            ...sourceValue,
                            position: destPosition,
                          };
                        }
                        if (ca.id === destValue.id) {
                          return {
                            ...destValue,
                            position: sourcePosition,
                          };
                        }
                        return ca;
                      }),
                    );
                  }}
                />
              );
            })}
          </div>
        )}
        <Modal
          open={state.customActionModal.isOpen}
          title={
            state.customActionModal.scope === 'add'
              ? 'Add custom action'
              : 'Edit custom action'
          }
          height="fit-content"
          footer={
            <ButtonGroup>
              <Button
                onClick={() => {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      customActionModal: {
                        ...prevState.customActionModal,
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
                      const existingCustomAction = sortedCustomActions.find(
                        (ca) => {
                          return ca.name === formMethods.getValues().name;
                        },
                      );

                      if (
                        existingCustomAction &&
                        existingCustomAction.id !== formMethods.getValues().id
                      ) {
                        formMethods.setError('name', {
                          message:
                            'A search filter with this name already exists',
                        });
                        return;
                      }

                      if (state.customActionModal.scope === 'add') {
                        onChange([...sortedCustomActions, data]);
                      } else {
                        onChange(
                          sortedCustomActions.map((customAction) => {
                            if (customAction.id === data.id) {
                              return {
                                ...data,
                              };
                            }
                            return customAction;
                          }),
                        );
                      }

                      setState((prevState) => {
                        return {
                          ...prevState,
                          customActionModal: {
                            ...prevState.customActionModal,
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
                {state.customActionModal.scope === 'add'
                  ? 'Add custom action'
                  : 'Update custom action'}
              </Button>
            </ButtonGroup>
          }
          onClose={() => {
            setState((prevState) => {
              return {
                ...prevState,
                customActionModal: {
                  ...prevState.customActionModal,
                  isOpen: false,
                },
              };
            });
          }}
        >
          <CustomActionForm />
        </Modal>
      </div>
    </FormProvider>
  );
};
