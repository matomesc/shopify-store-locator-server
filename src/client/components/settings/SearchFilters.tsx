import { SearchFilterSyncInput } from '@/dto/trpc';
import {
  Button,
  ButtonGroup,
  FormLayout,
  TextField,
  Text,
} from '@shopify/polaris';
import { useMemo, useState } from 'react';
import { v4 } from 'uuid';
import { ArrowUpIcon, ArrowDownIcon } from '@shopify/polaris-icons';
import { Modal } from '../Modal';

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
    addSearchFilter: {
      modalOpen: false,
      searchFilterId: v4(),
      searchFilterName: '',
      searchFilterNameError: '',
    },
    editSearchFilter: {
      modalOpen: false,
      searchFilterId: v4(),
      searchFilterName: '',
      searchFilterNameError: '',
    },
  });

  const sortedSearchFilters = useMemo(() => {
    return searchFilters.sort((searchFilterA, searchFilterB) => {
      return searchFilterA.position - searchFilterB.position;
    });
  }, [searchFilters]);

  return (
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
                addSearchFilter: {
                  ...prevState.addSearchFilter,
                  modalOpen: true,
                  searchFilterId: v4(),
                  searchFilterName: '',
                  searchFilterNameError: '',
                },
              };
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sortedSearchFilters.map((searchFilter, index) => {
            return (
              <SearchFilter
                key={searchFilter.id}
                searchFilter={searchFilter}
                onEdit={() => {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      editSearchFilter: {
                        ...prevState.editSearchFilter,
                        modalOpen: true,
                        searchFilterId: searchFilter.id,
                        searchFilterName: searchFilter.name,
                        searchFilterNameError: '',
                      },
                    };
                  });
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
      {/* Add search filter modal */}
      <Modal
        open={state.addSearchFilter.modalOpen}
        title="Add search filter"
        height="fit-content"
        footer={
          <ButtonGroup>
            <Button
              onClick={() => {
                setState((prevState) => {
                  return {
                    ...prevState,
                    addSearchFilter: {
                      ...prevState.addSearchFilter,
                      modalOpen: false,
                    },
                  };
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const existingSearchFilter = searchFilters.find((sf) => {
                  return sf.name === state.addSearchFilter.searchFilterName;
                });

                if (
                  existingSearchFilter &&
                  existingSearchFilter.id !==
                    state.addSearchFilter.searchFilterId
                ) {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      addSearchFilter: {
                        ...prevState.addSearchFilter,
                        searchFilterNameError:
                          'A search filter with this name already exists',
                      },
                    };
                  });
                  return;
                }
                if (state.addSearchFilter.searchFilterName.length === 0) {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      addSearchFilter: {
                        ...prevState.addSearchFilter,
                        searchFilterNameError: 'Search filter name is required',
                      },
                    };
                  });
                  return;
                }

                onChange([
                  ...searchFilters,
                  {
                    id: state.addSearchFilter.searchFilterId,
                    name: state.addSearchFilter.searchFilterName,
                    position: searchFilters.length,
                  },
                ]);

                setState((prevState) => {
                  return {
                    ...prevState,
                    addSearchFilter: {
                      ...prevState.addSearchFilter,
                      modalOpen: false,
                    },
                  };
                });
              }}
            >
              Add search filter
            </Button>
          </ButtonGroup>
        }
        onClose={() => {
          setState((prevState) => {
            return {
              ...prevState,
              addSearchFilter: {
                ...prevState.addSearchFilter,
                modalOpen: false,
              },
            };
          });
        }}
      >
        <FormLayout>
          <TextField
            autoComplete="off"
            label="Name"
            value={state.addSearchFilter.searchFilterName}
            onChange={(value) => {
              setState((prevState) => {
                return {
                  ...prevState,
                  addSearchFilter: {
                    ...prevState.addSearchFilter,
                    searchFilterName: value,
                  },
                };
              });
            }}
            error={state.addSearchFilter.searchFilterNameError}
          />
        </FormLayout>
      </Modal>
      {/* Edit search filter modal */}
      <Modal
        open={state.editSearchFilter.modalOpen}
        title="Edit search filter"
        height="fit-content"
        footer={
          <ButtonGroup>
            <Button
              onClick={() => {
                setState((prevState) => {
                  return {
                    ...prevState,
                    editSearchFilter: {
                      ...prevState.editSearchFilter,
                      modalOpen: false,
                    },
                  };
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const existingSearchFilter = searchFilters.find((sf) => {
                  return sf.name === state.editSearchFilter.searchFilterName;
                });

                if (
                  existingSearchFilter &&
                  existingSearchFilter.id !==
                    state.editSearchFilter.searchFilterId
                ) {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      editSearchFilter: {
                        ...prevState.editSearchFilter,
                        searchFilterNameError:
                          'A search filter with the name already exists',
                      },
                    };
                  });
                  return;
                }
                if (state.editSearchFilter.searchFilterName.length === 0) {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      editSearchFilter: {
                        ...prevState.editSearchFilter,
                        searchFilterNameError: 'Search filter name is required',
                      },
                    };
                  });
                  return;
                }

                onChange(
                  searchFilters.map((searchFilter) => {
                    if (
                      searchFilter.id === state.editSearchFilter.searchFilterId
                    ) {
                      return {
                        ...searchFilter,
                        name: state.editSearchFilter.searchFilterName,
                      };
                    }
                    return searchFilter;
                  }),
                );

                setState((prevState) => {
                  return {
                    ...prevState,
                    editSearchFilter: {
                      ...prevState.editSearchFilter,
                      modalOpen: false,
                    },
                  };
                });
              }}
            >
              Update search filter
            </Button>
          </ButtonGroup>
        }
        onClose={() => {
          setState((prevState) => {
            return {
              ...prevState,
              editSearchFilter: {
                ...prevState.editSearchFilter,
                modalOpen: false,
              },
            };
          });
        }}
      >
        <FormLayout>
          <TextField
            autoComplete="off"
            label="Name"
            value={state.editSearchFilter.searchFilterName}
            onChange={(value) => {
              setState((prevState) => {
                return {
                  ...prevState,
                  editSearchFilter: {
                    ...prevState.editSearchFilter,
                    searchFilterName: value,
                  },
                };
              });
            }}
            error={state.editSearchFilter.searchFilterNameError}
          />
        </FormLayout>
      </Modal>
    </div>
  );
};
