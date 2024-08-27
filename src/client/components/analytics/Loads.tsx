import { trpc } from '@/lib/trpc';
import { Button, Card, Layout, Select, Text } from '@shopify/polaris';
import { Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import { stringToColor } from '@/client/lib/color';
import { DateTime } from 'luxon';
import { Spinner } from '../Spinner';

Chart.register(PieController, ArcElement, Tooltip, Legend);

export const Loads: React.FC = () => {
  const [state, setState] = useState({
    selectedTimeRange: '30',
  });
  const sessionsGetAllQuery = trpc.sessions.getAll.useQuery();
  const map = useMap('mainMap');
  const visualizationLibrary = useMapsLibrary('visualization');
  const coreLibrary = useMapsLibrary('core');
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(
    null,
  );
  const filteredSessions = useMemo(() => {
    if (sessionsGetAllQuery.isPending || sessionsGetAllQuery.isError) {
      return [];
    }

    const createdAfter = DateTime.now()
      .minus({
        days: Number.parseInt(state.selectedTimeRange, 10),
      })
      .toJSDate();

    const sessions = sessionsGetAllQuery.data.sessions.filter((session) => {
      return session.createdAt.getTime() > createdAfter.getTime();
    });

    return sessions;
  }, [
    sessionsGetAllQuery.data?.sessions,
    sessionsGetAllQuery.isError,
    sessionsGetAllQuery.isPending,
    state.selectedTimeRange,
  ]);
  useEffect(() => {
    if (!visualizationLibrary || !coreLibrary || !map) {
      return;
    }

    const data = filteredSessions.map((session) => {
      return new coreLibrary.LatLng({
        lat: session.browserGeolocationLat || session.ipGeolocationLat,
        lng: session.browserGeolocationLng || session.ipGeolocationLng,
      });
    });

    // If a heatmap exists, remove it from the map to destroy it
    if (heatmapRef.current) {
      heatmapRef.current.setMap(null);
    }

    heatmapRef.current = new visualizationLibrary.HeatmapLayer({
      data,
    });

    heatmapRef.current.setMap(map);
  }, [coreLibrary, filteredSessions, map, visualizationLibrary]);
  const sessionsCountByCountry = useMemo(() => {
    const countByCountry = filteredSessions.reduce(
      (acc, session) => {
        const { country } = session;

        if (!country) {
          acc.Other = acc.Other ? acc.Other + 1 : 1;
        } else {
          acc[country] = acc[country] ? acc[country] + 1 : 1;
        }

        return acc;
      },
      {} as Record<string, number>,
    );

    const sorted = Object.entries(countByCountry).sort((a, b) => {
      if (a[1] > b[1]) {
        return -1;
      }
      if (a[1] < b[1]) {
        return 1;
      }
      return 0;
    });

    return {
      labels: sorted.map((v) => v[0]),
      data: sorted.map((v) => v[1]),
    };

    // TODO show at most 10 countries with the rest aggregate under Other
    // // Less than or equal to 10 countries
    // if (sorted.length <= 10) {
    //   return {
    //     labels: sorted.map((v) => v[0]),
    //     data: sorted.map((v) => v[1]),
    //   };
    // }

    // // More than 10 countries, aggregate remaining countries into other
    // const aggregate = sorted.slice(11);
    // const other = sorted.find((v) => v[0] === 'Other') || ['Other', 0];
    // aggregate.forEach((v) => {
    //   other[1] += v[1];
    // });
  }, [filteredSessions]);
  const sessionsCountByLanguage = useMemo(() => {
    const countByLanguage = filteredSessions.reduce(
      (acc, session) => {
        const { language } = session;

        if (!language) {
          acc.Other = acc.Other ? acc.Other + 1 : 1;
        } else {
          acc[language] = acc[language] ? acc[language] + 1 : 1;
        }

        return acc;
      },
      {} as Record<string, number>,
    );

    const sorted = Object.entries(countByLanguage).sort((a, b) => {
      if (a[1] > b[1]) {
        return -1;
      }
      if (a[1] < b[1]) {
        return 1;
      }
      return 0;
    });

    return {
      labels: sorted.map((v) => v[0]),
      data: sorted.map((v) => v[1]),
    };
  }, [filteredSessions]);
  const sessionsCountByDevice = useMemo(() => {
    const countByDevice = filteredSessions.reduce(
      (acc, session) => {
        const { mobile } = session;

        if (mobile) {
          acc.Mobile = acc.Mobile ? acc.Mobile + 1 : 1;
        } else {
          acc.Desktop = acc.Desktop ? acc.Desktop + 1 : 1;
        }

        return acc;
      },
      {} as Record<string, number>,
    );

    const sorted = Object.entries(countByDevice).sort((a, b) => {
      if (a[1] > b[1]) {
        return -1;
      }
      if (a[1] < b[1]) {
        return 1;
      }
      return 0;
    });

    return {
      labels: sorted.map((v) => v[0]),
      data: sorted.map((v) => v[1]),
    };
  }, [filteredSessions]);

  if (sessionsGetAllQuery.isPending || !visualizationLibrary || !coreLibrary) {
    return <Spinner />;
  }

  if (sessionsGetAllQuery.isError) {
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
              await Promise.all([sessionsGetAllQuery.refetch()]);
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
                  Map loads heatmap
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
              <div style={{ width: '100%', height: '400px' }}>
                <Map
                  id="mainMap"
                  mapId="mainMap"
                  defaultZoom={1}
                  defaultCenter={{
                    lat: 39,
                    lng: 34,
                  }}
                />
              </div>
            </Layout.Section>
          </Layout>
        </Card>
      </Layout.Section>
      <Layout.Section>
        <Card>
          <Layout>
            <Layout.Section>
              <Text as="h2" variant="headingMd">
                Map loads by country
              </Text>
            </Layout.Section>
            <Layout.Section>
              {filteredSessions.length === 0 && (
                <Text as="p" tone="subdued">
                  No data to display.
                </Text>
              )}
              {filteredSessions.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    height: '300px',
                  }}
                >
                  <Pie
                    data={{
                      labels: sessionsCountByCountry.labels,
                      datasets: [
                        {
                          label: 'Map loads',
                          data: sessionsCountByCountry.data,
                          backgroundColor: sessionsCountByCountry.labels.map(
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
      </Layout.Section>
      <Layout.Section>
        <Card>
          <Layout>
            <Layout.Section>
              <Text as="h2" variant="headingMd">
                Map loads by language
              </Text>
            </Layout.Section>
            <Layout.Section>
              {filteredSessions.length === 0 && (
                <Text as="p" tone="subdued">
                  No data to display.
                </Text>
              )}
              {filteredSessions.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    height: '300px',
                  }}
                >
                  <Pie
                    data={{
                      labels: sessionsCountByLanguage.labels,
                      datasets: [
                        {
                          label: 'Map loads',
                          data: sessionsCountByLanguage.data,
                          backgroundColor: sessionsCountByLanguage.labels.map(
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
      </Layout.Section>
      <Layout.Section>
        <Card>
          <Layout>
            <Layout.Section>
              <Text as="h2" variant="headingMd">
                Map loads by device
              </Text>
            </Layout.Section>
            <Layout.Section>
              {filteredSessions.length === 0 && (
                <Text as="p" tone="subdued">
                  No data to display.
                </Text>
              )}
              {filteredSessions.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    height: '300px',
                  }}
                >
                  <Pie
                    data={{
                      labels: sessionsCountByDevice.labels,
                      datasets: [
                        {
                          label: 'Map loads',
                          data: sessionsCountByDevice.data,
                          backgroundColor: sessionsCountByDevice.labels.map(
                            (label) =>
                              label === 'Desktop'
                                ? 'rgb(255, 99, 132)' // red
                                : 'rgb(54, 162, 235)', // blue
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
      </Layout.Section>
    </Layout>
  );
};
