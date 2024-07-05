import { SearchFilterSyncInput } from '@/dto/trpc';
import {
  Button,
  ButtonGroup,
  FormLayout,
  TextField,
  Text,
  Checkbox,
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

const FormData = SearchFilterSyncInput.element;
// eslint-disable-next-line @typescript-eslint/no-redeclare
type FormData = z.infer<typeof FormData>;

const SearchFilterForm: React.FC = () => {
  const {
    control,
    formState: { errors },
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
  searchFilter: SearchFilterSyncInput[number];
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
        <Text as="p" fontWeight="bold">
          {searchFilter.name}
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

export interface SearchFiltersProps {
  searchFilters: SearchFilterSyncInput;
  onChange: (searchFilters: SearchFilterSyncInput) => void;
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
    return searchFilters.sort((searchFilterA, searchFilterB) => {
      return searchFilterA.position - searchFilterB.position;
    });
  }, [searchFilters]);

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
                showInList: true,
                showInMap: true,
              });
            }}
          >
            Add search filter
          </Button>
        </div>
        {sortedSearchFilters.length === 0 && (
          <div>
            <p>You have no search filters. Add your first one.</p>
          </div>
        )}
        {sortedSearchFilters.length > 0 && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
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
        )}
        {/* Search filter modal */}
        <Modal
          open={state.searchFilterModal.isOpen}
          title={
            state.searchFilterModal.scope === 'add'
              ? 'Add search filter'
              : 'Edit search filter'
          }
          height="fit-content"
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
      </div>
    </FormProvider>
  );
};
