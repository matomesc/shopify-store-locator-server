import { trpc } from '@/lib/trpc';
import { useMap, useMapsLibrary, Map } from '@vis.gl/react-google-maps';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Layout, Select, Text } from '@shopify/polaris';
import { stringToColor } from '@/client/lib/color';
import { ArcElement, Chart, Legend, PieController, Tooltip } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Spinner } from '../Spinner';

Chart.register(PieController, ArcElement, Tooltip, Legend);

export const Searches: React.FC = () => {
  const [state, setState] = useState({
    selectedTimeRange: '30',
  });
  const searchEventsGetAllQuery = trpc.searchEvents.getAll.useQuery();
  const map = useMap('mainMap');
  const visualizationLibrary = useMapsLibrary('visualization');
  const coreLibrary = useMapsLibrary('core');
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(
    null,
  );
  const filteredSearchEvents = useMemo(() => {
    if (searchEventsGetAllQuery.isPending || searchEventsGetAllQuery.isError) {
      return [];
    }

    const createdAfter = DateTime.now()
      .minus({
        days: Number.parseInt(state.selectedTimeRange, 10),
      })
      .toJSDate();

    const searchEvents = searchEventsGetAllQuery.data.searchEvents.filter(
      (searchEvent) => {
        return searchEvent.createdAt.getTime() > createdAfter.getTime();
      },
    );

    return searchEvents;
  }, [
    searchEventsGetAllQuery.data?.searchEvents,
    searchEventsGetAllQuery.isError,
    searchEventsGetAllQuery.isPending,
    state.selectedTimeRange,
  ]);
  useEffect(() => {
    if (!visualizationLibrary || !coreLibrary || !map) {
      return;
    }

    const data = filteredSearchEvents.map((searchEvent) => {
      return new coreLibrary.LatLng({
        lat: searchEvent.lat,
        lng: searchEvent.lng,
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
  }, [coreLibrary, filteredSearchEvents, map, visualizationLibrary]);
  const searchEventsCountByCountry = useMemo(() => {
    const countByCountry = filteredSearchEvents.reduce(
      (acc, searchEvent) => {
        const { country } = searchEvent;

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
  }, [filteredSearchEvents]);

  if (
    searchEventsGetAllQuery.isPending ||
    !visualizationLibrary ||
    !coreLibrary
  ) {
    return <Spinner />;
  }

  if (searchEventsGetAllQuery.isError) {
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
              await Promise.all([searchEventsGetAllQuery.refetch()]);
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
                  Searches heatmap
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
                Searches by country
              </Text>
            </Layout.Section>
            <Layout.Section>
              {filteredSearchEvents.length === 0 && (
                <Text as="p" tone="subdued">
                  No data to display.
                </Text>
              )}
              {filteredSearchEvents.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    height: '300px',
                  }}
                >
                  <Pie
                    data={{
                      labels: searchEventsCountByCountry.labels,
                      datasets: [
                        {
                          label: 'Searches',
                          data: searchEventsCountByCountry.data,
                          backgroundColor:
                            searchEventsCountByCountry.labels.map(
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
    </Layout>
  );
};
