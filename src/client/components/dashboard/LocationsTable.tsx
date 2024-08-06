import {
  IndexTable,
  useIndexResourceState,
  Text,
  Badge,
  Button,
  Pagination,
  ButtonGroup,
  IndexFilters,
  IndexFiltersMode,
  Select,
} from '@shopify/polaris';
import { Location } from '@/dto/trpc';
import { useRouter } from 'next/router';
import * as Sentry from '@sentry/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { toast } from '@/client/lib/toast';
import { trpc } from '@/lib/trpc';
import { Modal } from '../Modal';

export interface LocationsTableProps {
  locations: Location[];
}
export const LocationsTable: React.FC<LocationsTableProps> = ({
  locations,
}) => {
  const utils = trpc.useUtils();
  const router = useRouter();
  const [state, setState] = useState({
    query: '',
    page: 1,
    limit: 10,
    indexFiltersMode: IndexFiltersMode.Default,
    indexFiltersSelectedTab: 0,
    deleteModalOpen: false,
    deleteModalLocationId: '',
    deleteManyModalOpen: false,
  });
  const locationsDeleteMutation = trpc.locations.delete.useMutation();
  const locationsDeleteManyMutation = trpc.locations.deleteMany.useMutation();
  const filteredAndSortedLocations = useMemo(() => {
    return locations
      .filter((location) => {
        const text = [
          location.name,
          location.phone,
          location.email,
          location.website,
          location.address1,
          location.address2,
          location.city,
          location.state,
          location.zip,
          location.country,
        ]
          .map((value) => value.toLowerCase())
          .join(', ');

        if (state.indexFiltersSelectedTab === 1) {
          // Active tab is selected
          return location.active && text.includes(state.query.toLowerCase());
        }
        if (state.indexFiltersSelectedTab === 2) {
          // Inactive tab is selected
          return !location.active && text.includes(state.query.toLowerCase());
        }
        return text.includes(state.query.toLowerCase());
      })
      .sort((locationA, locationB) => {
        if (locationA.createdAt.getTime() > locationB.createdAt.getTime()) {
          return -1;
        }
        if (locationA.createdAt.getTime() < locationB.createdAt.getTime()) {
          return 1;
        }

        return 0;
      });
  }, [locations, state.indexFiltersSelectedTab, state.query]);
  const slicedLocations = useMemo(() => {
    return filteredAndSortedLocations.slice(
      (state.page - 1) * state.limit,
      state.page * state.limit,
    );
  }, [filteredAndSortedLocations, state.limit, state.page]);
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(locations);
  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    setState((prevState) => {
      return {
        ...prevState,
        page: router.query.page
          ? Number.parseInt(String(router.query.page), 10)
          : 1,
        limit: router.query.limit
          ? Number.parseInt(String(router.query.limit), 10)
          : 10,
      };
    });
  }, [router.isReady, router.query.limit, router.query.page]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <IndexFilters
        mode={state.indexFiltersMode}
        filters={[]}
        selected={state.indexFiltersSelectedTab}
        queryValue={state.query}
        queryPlaceholder="Search names, emails, phone numbers, addresses"
        canCreateNewView={false}
        tabs={[
          { id: '0', content: 'All' },
          { id: '1', content: 'Active' },
          { id: '2', content: 'Inactive' },
        ]}
        onSelect={(tab) => {
          setState((prevState) => {
            return {
              ...prevState,
              indexFiltersSelectedTab: tab,
            };
          });
        }}
        setMode={(mode) => {
          setState((prevState) => {
            return {
              ...prevState,
              indexFiltersMode: mode,
            };
          });
        }}
        onQueryChange={(query) => {
          setState((prevState) => {
            return {
              ...prevState,
              query,
            };
          });
        }}
        onQueryClear={() => {
          setState((prevState) => {
            return {
              ...prevState,
              query: '',
            };
          });
        }}
        onClearAll={() => {
          setState((prevState) => {
            return {
              ...prevState,
              query: '',
            };
          });
        }}
        cancelAction={{
          onAction: () => {
            setState((prevState) => {
              return {
                ...prevState,
                query: '',
              };
            });
          },
          disabled: false,
          loading: false,
        }}
      />
      <IndexTable
        resourceName={{ singular: 'location', plural: 'locations' }}
        headings={[
          { title: 'Name' },
          { title: 'Active' },
          { title: 'Actions' },
        ]}
        itemCount={locations.length}
        selectedItemsCount={
          allResourcesSelected ? 'All' : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        promotedBulkActions={[
          {
            content: 'Delete locations',
            onAction: () => {
              setState((prevState) => {
                return {
                  ...prevState,
                  deleteManyModalOpen: true,
                };
              });
            },
          },
        ]}
      >
        {slicedLocations.map((location, index) => {
          return (
            <IndexTable.Row
              id={location.id}
              position={index}
              key={location.id}
              selected={selectedResources.includes(location.id)}
            >
              <IndexTable.Cell>
                <Text as="p" fontWeight="bold">
                  {location.name}
                </Text>
                {[
                  location.address1,
                  location.address2,
                  location.city,
                  location.state,
                  location.zip,
                  location.country,
                ]
                  .filter((value) => !!value)
                  .join(', ')}
              </IndexTable.Cell>
              <IndexTable.Cell>
                {location.active ? (
                  <Badge tone="success">Active</Badge>
                ) : (
                  <Badge tone="new">Inactive</Badge>
                )}
              </IndexTable.Cell>
              <IndexTable.Cell>
                <ButtonGroup>
                  <div onClick={(event) => event.stopPropagation()}>
                    <Button
                      onClick={() => {
                        router
                          .push(`/locations/${location.id}/edit`)
                          .catch((err) => {
                            Sentry.captureException(err);
                          });
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                  <div onClick={(event) => event.stopPropagation()}>
                    <Button
                      tone="critical"
                      onClick={() => {
                        setState((prevState) => {
                          return {
                            ...prevState,
                            deleteModalOpen: true,
                            deleteModalLocationId: location.id,
                          };
                        });
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </ButtonGroup>
              </IndexTable.Cell>
            </IndexTable.Row>
          );
        })}
      </IndexTable>
      {/* Pagination */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        <Pagination
          hasPrevious={state.page > 1}
          onPrevious={() => {
            setState((prevState) => {
              router
                .push(
                  { query: { ...router.query, page: prevState.page - 1 } },
                  undefined,
                  {
                    shallow: true,
                  },
                )
                .catch((err) => {
                  Sentry.captureException(err);
                });

              return {
                ...prevState,
                page: prevState.page - 1,
              };
            });
          }}
          hasNext={state.page * state.limit < filteredAndSortedLocations.length}
          onNext={() => {
            setState((prevState) => {
              router
                .push(
                  { query: { ...router.query, page: prevState.page + 1 } },
                  undefined,
                  {
                    shallow: true,
                  },
                )
                .catch((err) => {
                  Sentry.captureException(err);
                });

              return {
                ...prevState,
                page: prevState.page + 1,
              };
            });
          }}
        />
        <Select
          label=""
          labelHidden
          options={[
            { value: '10', label: '10' },
            { value: '25', label: '25' },
            { value: '50', label: '50' },
            { value: '100', label: '100' },
          ]}
          value={String(state.limit)}
          onChange={(value) => {
            setState((prevState) => {
              router
                .push({ query: { ...router.query, limit: value } }, undefined, {
                  shallow: true,
                })
                .catch((err) => {
                  Sentry.captureException(err);
                });
              return {
                ...prevState,
                limit: Number.parseInt(value, 10),
              };
            });
          }}
        />
      </div>
      {/* Delete single location confirmation modal */}
      <Modal
        open={state.deleteModalOpen}
        title="Delete location"
        maxWidth="500px"
        footer={
          <ButtonGroup>
            <Button
              onClick={() => {
                setState((prevState) => {
                  return {
                    ...prevState,
                    deleteModalOpen: false,
                    deleteModalLocationId: '',
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
                    id: state.deleteModalLocationId,
                  });
                  await utils.locations.getAll.invalidate();
                  setState((prevState) => {
                    return {
                      ...prevState,
                      deleteModalOpen: false,
                    };
                  });
                  toast('success', 'Location deleted');
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
              deleteModalLocationId: '',
            };
          });
        }}
      >
        <p>Are you sure you want to delete this location?</p>
      </Modal>
      {/* Delete many locations confirmation modal */}
      <Modal
        open={state.deleteManyModalOpen}
        title="Delete locations"
        maxWidth="500px"
        footer={
          <ButtonGroup>
            <Button
              onClick={() => {
                setState((prevState) => {
                  return {
                    ...prevState,
                    deleteManyModalOpen: false,
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
                  await locationsDeleteManyMutation.mutateAsync({
                    ids: selectedResources,
                  });
                  await utils.locations.getAll.invalidate();
                  toast('success', 'Locations deleted');
                  setState((prevState) => {
                    return {
                      ...prevState,
                      deleteManyModalOpen: false,
                    };
                  });
                } catch (err) {
                  toast('error', 'Failed to delete locations');
                  Sentry.captureException(err);
                }
              }}
            >
              Delete {String(selectedResources.length)} locations
            </Button>
          </ButtonGroup>
        }
        height="fit-content"
        onClose={() => {
          setState((prevState) => {
            return {
              ...prevState,
              deleteManyModalOpen: false,
            };
          });
        }}
      >
        <p>
          Are you sure you want to delete {selectedResources.length} locations?
        </p>
      </Modal>
    </div>
  );
};
