import { trpc } from '@/lib/trpc';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  IndexTable,
  Layout,
  Pagination,
  Select,
  Text,
} from '@shopify/polaris';
import { useRouter } from 'next/router';
import * as Sentry from '@sentry/nextjs';
import { Spinner } from '../Spinner';

export const Locations: React.FC = () => {
  const router = useRouter();
  const [state, setState] = useState({
    selectedTimeRange: '30',
    page: 1,
    limit: 10,
  });
  const locationClickEventsGetAllQuery =
    trpc.locationClickEvents.getAll.useQuery();
  const locationsGetAllQuery = trpc.locations.getAll.useQuery();
  // const createdAfter = useMemo(() => {
  //   return DateTime.now()
  //     .minus({ days: Number.parseInt(state.selectedTimeRange, 10) })
  //     .toJSDate();
  // }, [state.selectedTimeRange]);
  // const locationClickEventsGetCountByLocation =
  //   trpc.locationClickEvents.getCountByLocation.useQuery({
  //     createdAfter,
  //   });
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
  const locationsById = useMemo(() => {
    if (locationsGetAllQuery.isPending || locationsGetAllQuery.isError) {
      return {};
    }

    return locationsGetAllQuery.data.locations.reduce(
      (acc, location) => {
        acc[location.id] = location;
        return acc;
      },
      {} as Record<
        string,
        (typeof locationsGetAllQuery)['data']['locations'][number]
      >,
    );
  }, [
    locationsGetAllQuery.data?.locations,
    locationsGetAllQuery.isError,
    locationsGetAllQuery.isPending,
  ]);
  const filteredAndSortedData = useMemo(() => {
    if (
      locationClickEventsGetAllQuery.isPending ||
      locationClickEventsGetAllQuery.isError
    ) {
      return [];
    }

    const createdAfter = DateTime.now()
      .minus({
        days: Number.parseInt(state.selectedTimeRange, 10),
      })
      .toJSDate();

    const filtered =
      locationClickEventsGetAllQuery.data.locationClickEvents.filter(
        (value) => {
          return value.createdAt.getTime() > createdAfter.getTime();
        },
      );

    const grouped = filtered.reduce(
      (acc, value) => {
        acc[value.locationId] = acc[value.locationId]
          ? acc[value.locationId] + 1
          : 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const sorted = Object.entries(grouped).sort((a, b) => {
      if (a[1] > b[1]) {
        return -1;
      }
      if (a[1] < b[1]) {
        return 1;
      }
      return 0;
    });

    return sorted;
  }, [
    locationClickEventsGetAllQuery.data?.locationClickEvents,
    locationClickEventsGetAllQuery.isError,
    locationClickEventsGetAllQuery.isPending,
    state.selectedTimeRange,
  ]);
  const paginatedData = useMemo(() => {
    return filteredAndSortedData.slice(
      (state.page - 1) * state.limit,
      state.page * state.limit,
    );
  }, [filteredAndSortedData, state.limit, state.page]);
  // const countByCountry = useMemo(() => {
  //   const counts = filteredAndSortedData.reduce(
  //     (acc, [locationId, count]) => {
  //       const { country } = locationsById[locationId];

  //       acc[country] = acc[country] ? acc[country] + count : count;

  //       return acc;
  //     },
  //     {} as Record<string, number>,
  //   );

  //   const sorted = Object.entries(counts).sort((a, b) => {
  //     if (a[1] > b[1]) {
  //       return -1;
  //     }
  //     if (a[1] < b[1]) {
  //       return 1;
  //     }
  //     return 0;
  //   });

  //   return {
  //     labels: sorted.map((v) => v[0]),
  //     data: sorted.map((v) => v[1]),
  //   };
  // }, [filteredAndSortedData, locationsById]);

  if (
    locationClickEventsGetAllQuery.isPending ||
    locationsGetAllQuery.isPending
  ) {
    return <Spinner />;
  }

  if (locationClickEventsGetAllQuery.isError || locationsGetAllQuery.isError) {
    return (
      <Card>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <p>Failed to load data</p>
          <Button
            onClick={async () => {
              await Promise.all([
                locationClickEventsGetAllQuery.refetch(),
                locationsGetAllQuery.refetch(),
              ]);
            }}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Layout>
      <Layout.Section>
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
                <Text as="h2" variant="headingMd">
                  Popular locations
                </Text>
                <Select
                  label="Time range"
                  value={state.selectedTimeRange}
                  options={[
                    { label: 'Last day', value: '1' },
                    { label: 'Last 7 days', value: '7' },
                    { label: 'Last 14 days', value: '14' },
                    { label: 'Last 30 days', value: '30' },
                    { label: 'Last 60 days', value: '60' },
                    { label: 'Last 90 days', value: '90' },
                    { label: 'Last 180 days', value: '180' },
                    { label: 'Last 365 days', value: '365' },
                  ]}
                  onChange={(value) => {
                    setState((prevState) => {
                      return {
                        ...prevState,
                        selectedTimeRange: value,
                      };
                    });
                  }}
                />
              </div>
            </Layout.Section>
            <Layout.Section>
              {filteredAndSortedData.length === 0 && (
                <Text as="p" tone="subdued">
                  No data to display.
                </Text>
              )}
              {filteredAndSortedData.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <IndexTable
                    headings={[
                      { title: 'Location name' },
                      { title: 'Click count' },
                      { title: 'Actions' },
                    ]}
                    itemCount={filteredAndSortedData.length}
                    selectable={false}
                  >
                    {paginatedData.map(([locationId, count], index) => {
                      const location = locationsById[locationId];
                      return (
                        <IndexTable.Row
                          key={location.id}
                          id={location.id}
                          position={index}
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
                          <IndexTable.Cell>{count}</IndexTable.Cell>
                          <IndexTable.Cell>
                            <Button
                              onClick={() => {
                                router
                                  .push(`/locations/${location.id}/edit`)
                                  .catch((err) => {
                                    Sentry.captureException(err);
                                  });
                              }}
                            >
                              View location
                            </Button>
                          </IndexTable.Cell>
                        </IndexTable.Row>
                      );
                    })}
                  </IndexTable>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Pagination
                      hasPrevious={state.page > 1}
                      onPrevious={() => {
                        setState((prevState) => {
                          router
                            .push(
                              {
                                query: {
                                  ...router.query,
                                  page: prevState.page - 1,
                                },
                              },
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
                      hasNext={
                        state.page * state.limit < filteredAndSortedData.length
                      }
                      onNext={() => {
                        setState((prevState) => {
                          router
                            .push(
                              {
                                query: {
                                  ...router.query,
                                  page: prevState.page + 1,
                                },
                              },
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
                            .push(
                              { query: { ...router.query, limit: value } },
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
                            limit: Number.parseInt(value, 10),
                          };
                        });
                      }}
                    />
                  </div>
                </div>
              )}
            </Layout.Section>
          </Layout>
        </Card>
      </Layout.Section>
      {/* <Layout.Section>
        <Card>
          <Layout>
            <Layout.Section>
              <Text as="h2" variant="headingMd">
                Searches by country
              </Text>
            </Layout.Section>
            <Layout.Section>
              {filteredAndSortedData.length === 0 && (
                <Text as="p" tone="subdued">
                  No data to display.
                </Text>
              )}
              {filteredAndSortedData.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    height: '300px',
                  }}
                >
                  <Pie
                    data={{
                      labels: countByCountry.labels,
                      datasets: [
                        {
                          label: 'Clicks',
                          data: countByCountry.data,
                          backgroundColor: countByCountry.labels.map(
                            (label) => `#${stringToColor(label)}`,
                          ),
                        },
                      ],
                    }}
                  />
                </div>
              )}
            </Layout.Section>
          </Layout>
        </Card>
      </Layout.Section> */}
    </Layout>
  );
};
