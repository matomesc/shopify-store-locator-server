import { SearchFiltersSyncInput } from '@/dto/trpc';
import {
  Button,
  ButtonGroup,
  FormLayout,
  TextField,
  Text,
  Checkbox,
  Badge,
  Card,
  Layout,
} from '@shopify/polaris';
import { useMemo, useState } from 'react';
import { v4 } from 'uuid';
import { ArrowUpIcon, ArrowDownIcon } from '@shopify/polaris-icons';
import { z } from 'zod';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Sentry from '@sentry/nextjs';
import { Modal } from '../Modal';

const FormData = SearchFiltersSyncInput.element;
// eslint-disable-next-line @typescript-eslint/no-redeclare
type FormData = z.infer<typeof FormData>;

const SearchFilterForm: React.FC = () => {
  const { control } = useFormContext<FormData>();

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
                error={fieldState.error?.message}
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

interface SearchFilterProps {
  searchFilter: SearchFiltersSyncInput[number];
  onDelete: () => void;
  onEdit: () => void;
  onUp: () => void;
  onDown: () => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchFilter,
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
            {searchFilter.name}
          </Text>
          {!searchFilter.enabled && <Badge tone="new">Disabled</Badge>}
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

export interface SearchFiltersProps {
  searchFilters: SearchFiltersSyncInput;
  onChange: (searchFilters: SearchFiltersSyncInput) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchFilters,
  onChange,
}) => {
  const [state, setState] = useState({
    searchFilterModal: {
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
  const sortedSearchFilters = useMemo(() => {
    return [...searchFilters].sort((searchFilterA, searchFilterB) => {
      return searchFilterA.position - searchFilterB.position;
    });
  }, [searchFilters]);

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
                Search filters
              </Text>
              <Button
                onClick={() => {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      searchFilterModal: {
                        ...prevState.searchFilterModal,
                        isOpen: true,
                        scope: 'add',
                      },
                    };
                  });
                  formMethods.reset({
                    id: v4(),
                    name: '',
                    position: sortedSearchFilters.length,
                    enabled: true,
                    showInList: true,
                    showInMap: true,
                  });
                }}
              >
                Add search filter
              </Button>
            </div>
          </Layout.Section>
          <Layout.Section>
            <Text as="p">
              Use search filters to allow users to filter locations based on a
              certain criteria. For example, you can add a Wheelchair Accessible
              filter to allow users to easily find wheelchair accessible
              locations.
            </Text>
          </Layout.Section>
          {sortedSearchFilters.length > 0 && (
            <Layout.Section>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {sortedSearchFilters.map((searchFilter, index) => {
                  return (
                    <SearchFilter
                      key={searchFilter.id}
                      searchFilter={searchFilter}
                      onEdit={() => {
                        setState((prevState) => {
                          return {
                            ...prevState,
                            searchFilterModal: {
                              ...prevState.searchFilterModal,
                              isOpen: true,
                              scope: 'edit',
                            },
                          };
                        });
                        formMethods.reset(searchFilter);
                      }}
                      onDelete={() => {
                        const remainingSearchFilters = sortedSearchFilters
                          .filter((sf) => {
                            return sf.id !== searchFilter.id;
                          })
                          .map((sf, idx) => {
                            return {
                              ...sf,
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
                        const sourceValue = searchFilter;
                        const sourcePosition = searchFilter.position;
                        const destIndex = index - 1;
                        const destValue = sortedSearchFilters[destIndex];
                        const destPosition = destValue.position;

                        onChange(
                          sortedSearchFilters.map((sf) => {
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
                        if (index === sortedSearchFilters.length - 1) {
                          // Can't move down
                          return;
                        }
                        const sourceValue = searchFilter;
                        const sourcePosition = searchFilter.position;
                        const destIndex = index + 1;
                        const destValue = sortedSearchFilters[destIndex];
                        const destPosition = destValue.position;

                        onChange(
                          sortedSearchFilters.map((sf) => {
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
        {/* Search filter modal */}
        <Modal
          open={state.searchFilterModal.isOpen}
          title={
            state.searchFilterModal.scope === 'add'
              ? 'Add search filter'
              : 'Edit search filter'
          }
          height="fit-content"
          maxWidth="500px"
          footer={
            <ButtonGroup>
              <Button
                onClick={() => {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      searchFilterModal: {
                        ...prevState.searchFilterModal,
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
                      const existingSearchFilter = searchFilters.find((sf) => {
                        return sf.name === formMethods.getValues().name;
                      });

                      if (
                        existingSearchFilter &&
                        existingSearchFilter.id !== formMethods.getValues().id
                      ) {
                        formMethods.setError('name', {
                          message:
                            'A search filter with this name already exists',
                        });
                        return;
                      }

                      if (state.searchFilterModal.scope === 'add') {
                        onChange([...sortedSearchFilters, data]);
                      } else {
                        onChange(
                          sortedSearchFilters.map((searchFilter) => {
                            if (searchFilter.id === data.id) {
                              return {
                                ...data,
                              };
                            }
                            return searchFilter;
                          }),
                        );
                      }

                      setState((prevState) => {
                        return {
                          ...prevState,
                          searchFilterModal: {
                            ...prevState.searchFilterModal,
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
                {state.searchFilterModal.scope === 'add'
                  ? 'Add search filter'
                  : 'Update search filter'}
              </Button>
            </ButtonGroup>
          }
          onClose={() => {
            setState((prevState) => {
              return {
                ...prevState,
                searchFilterModal: {
                  ...prevState.searchFilterModal,
                  isOpen: false,
                },
              };
            });
          }}
        >
          <SearchFilterForm />
        </Modal>
      </Card>
    </FormProvider>
  );
};
