import {
  DropZone,
  Layout,
  Link,
  Thumbnail,
  Text,
  Button,
  ButtonGroup,
  Spinner,
} from '@shopify/polaris';
import Papa from 'papaparse';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import {
  CustomAction,
  CustomField,
  LocationsCreateManyInput,
  SearchFilter,
} from '@/dto/trpc';
import { useState } from 'react';
import { NoteIcon } from '@shopify/polaris-icons';
import { v4 } from 'uuid';
import { z } from 'zod';
import { chunk } from 'lodash';
import { trpc } from '@/lib/trpc';
import { Modal } from '../Modal';

export function getCustomFieldHeaderName(customFieldName: string) {
  return `Custom field: ${customFieldName}`;
}

export function getCustomActionHeaderName(customActionName: string) {
  return `Custom action: ${customActionName}`;
}

function parseBoolean(value: string) {
  const lowercase = value.toLowerCase();
  return (
    lowercase === 'y' ||
    lowercase === 'yes' ||
    lowercase === 't' ||
    lowercase === 'true' ||
    lowercase === '1'
  );
}

function parseFloat(value: string) {
  const number = Number.parseFloat(value);

  if (Number.isNaN(number)) {
    return null;
  }

  return number;
}

const parsedRowKeyToHeader: Record<string, string> = {
  name: 'Name',
  active: 'Active',
  phone: 'Phone',
  email: 'Email',
  website: 'Website',
  address1: 'Address',
  address2: 'Apartment, suite, etc.',
  city: 'City',
  state: 'State/Province',
  zip: 'Zip/Postal code',
  country: 'Country',
  lat: 'Latitude',
  lng: 'Longitude',
};

const ParsedRow = LocationsCreateManyInput.element
  .omit({ lat: true, lng: true })
  .merge(
    z.object({
      lat: z.number().nullable(),
      lng: z.number().nullable(),
    }),
  );
// eslint-disable-next-line @typescript-eslint/no-redeclare
type ParsedRow = z.infer<typeof ParsedRow>;

const geocodingCache: Record<string, { lat: number; lng: number }> = {};

export interface ImportModalProps {
  open: boolean;
  searchFilters: SearchFilter[];
  customFields: CustomField[];
  customActions: CustomAction[];
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  open,
  searchFilters,
  customFields,
  customActions,
  onClose,
}) => {
  const [state, setState] = useState({
    file: null as File | null,
    parsed: false,
    parsedRows: [] as ParsedRow[],
    parseErrors: [] as string[],
    rows: [] as LocationsCreateManyInput,
    geocodingStarted: false,
    geocodingFinished: false,
    geocodingErrors: [] as number[],
    importStarted: false,
    importFinished: false,
    importError: false,
  });
  const geocodingLibrary = useMapsLibrary('geocoding');
  const utils = trpc.useUtils();
  const locationsCreateManyMutation = trpc.locations.createMany.useMutation();

  if (!geocodingLibrary) {
    return <div />;
  }

  return (
    <Modal
      open={open}
      title="Import locations"
      onClose={onClose}
      shouldCloseOnEsc
      maxWidth="500px"
      height="fit-content"
      footer={
        <ButtonGroup>
          <Button onClick={onClose}>Cancel</Button>
          {(!state.importFinished || state.importError) && (
            <Button
              variant="primary"
              disabled={
                !state.parsed ||
                state.parseErrors.length > 0 ||
                !state.geocodingFinished ||
                state.geocodingErrors.length > 0
              }
              loading={state.importStarted && !state.importFinished}
              onClick={async () => {
                setState((prevState) => {
                  return {
                    ...prevState,
                    importStarted: true,
                    importFinished: false,
                    importError: false,
                  };
                });

                try {
                  await locationsCreateManyMutation.mutateAsync(state.rows);
                  await utils.locations.getAll.invalidate();
                } catch (err) {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      importError: true,
                    };
                  });
                } finally {
                  setState((prevState) => {
                    return {
                      ...prevState,
                      importFinished: true,
                    };
                  });
                }
              }}
            >
              Import
            </Button>
          )}
          {state.importFinished && !state.importError && (
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          )}
        </ButtonGroup>
      }
    >
      <Layout>
        <Layout.Section>
          <p>
            You can import locations from a CSV file. Download the{' '}
            <Link
              onClick={() => {
                const sample: Record<string, string> = {
                  Name: 'Google HQ',
                  Active: 'yes',
                  Phone: '+1 234 567 8999',
                  Email: 'hq@google.com',
                  Website: 'https://google.com',
                  Address: '1600 Amphitheatre Parkway',
                  'Apartment, suite, etc.': '1st floor',
                  City: 'Mountain View',
                  'State/Province': 'California',
                  'Zip/Postal code': '94043',
                  Country: 'US',
                  Latitude: '37.42',
                  Longitude: '-122.08',
                  'Search filters': searchFilters
                    .map((searchFilter) => {
                      return searchFilter.name;
                    })
                    .join(' | '),
                };
                customFields
                  .sort((customFieldA, customFieldB) => {
                    return customFieldA.position - customFieldB.position;
                  })
                  .forEach((customField) => {
                    sample[getCustomFieldHeaderName(customField.name)] =
                      customField.name;
                  });
                customActions
                  .sort((customActionA, customActionB) => {
                    return customActionA.position - customActionB.position;
                  })
                  .forEach((customAction) => {
                    sample[getCustomActionHeaderName(customAction.name)] =
                      customAction.name;
                  });

                const csv = Papa.unparse([sample]);
                const url = window.URL.createObjectURL(new Blob([csv]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'sample.csv');
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
              }}
            >
              sample
            </Link>{' '}
            and populate it with your location data then import it.
          </p>
        </Layout.Section>
        <Layout.Section>
          <DropZone
            allowMultiple={false}
            accept="text/csv"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onDrop={async (files) => {
              if (files.length === 0) {
                return;
              }
              const [file] = files;

              setState((prevState) => {
                return {
                  ...prevState,
                  file,
                  parsed: false,
                  parsedRows: [],
                  parseErrors: [],
                  rows: [],
                  geocodingStarted: false,
                  geocodingFinished: false,
                  geocodingErrors: [],
                  importStarted: false,
                  importFinished: false,
                  importError: false,
                };
              });

              const text = await file.text();

              const result = Papa.parse<Record<string, string>>(text, {
                header: true,
              });

              if (result.errors.length > 0) {
                const errors = result.errors.map((error) => {
                  let message: string = '';

                  switch (error.code) {
                    case 'InvalidQuotes': {
                      message =
                        typeof error.row === 'number'
                          ? `Row ${error.row + 2}: invalid quotes`
                          : 'Invalid quotes';
                      break;
                    }
                    case 'MissingQuotes': {
                      message =
                        typeof error.row === 'number'
                          ? `Row ${error.row + 2}: missing quotes`
                          : 'Missing quotes';
                      break;
                    }
                    case 'TooFewFields': {
                      message =
                        typeof error.row === 'number'
                          ? `Row ${error.row + 2}: too few fields`
                          : 'Too few fields';
                      break;
                    }
                    case 'TooManyFields': {
                      message =
                        typeof error.row === 'number'
                          ? `Row ${error.row + 2}: too many fields`
                          : 'Too many fields';
                      break;
                    }
                    case 'UndetectableDelimiter': {
                      message =
                        typeof error.row === 'number'
                          ? `Row ${error.row + 2}: undetectable delimiter`
                          : 'Undetectable delimiter';
                      break;
                    }
                    default: {
                      message = 'Failed to parse file';
                    }
                  }

                  return message;
                });

                setState((prevState) => {
                  return {
                    ...prevState,
                    parseErrors: errors,
                    parsed: true,
                  };
                });

                return;
              }

              // Check to ensure all columns are present
              if (!result.meta.fields) {
                setState((prevState) => {
                  return {
                    ...prevState,
                    parseErrors: ['Missing fields'],
                    parsed: true,
                  };
                });
                return;
              }

              const requiredFields = [
                'Name',
                'Active',
                'Phone',
                'Email',
                'Website',
                'Address',
                'Apartment, suite, etc.',
                'City',
                'State/Province',
                'Zip/Postal code',
                'Country',
                'Latitude',
                'Longitude',
                'Search filters',
                ...customFields.map((customField) => {
                  return getCustomFieldHeaderName(customField.name);
                }),
                ...customActions.map((customAction) => {
                  return getCustomActionHeaderName(customAction.name);
                }),
              ];
              const missingFields: string[] = [];

              requiredFields.forEach((field) => {
                if (!result.meta.fields?.includes(field)) {
                  missingFields.push(field);
                }
              });

              if (missingFields.length > 0) {
                setState((prevState) => {
                  return {
                    ...prevState,
                    parseErrors: [
                      `Missing columns: ${missingFields.join(', ')}`,
                    ],
                    parsed: true,
                  };
                });
                return;
              }

              const parsedRows: ParsedRow[] = [];
              const parseErrors: string[] = [];

              result.data.forEach((row, index) => {
                const parseCandidate = {
                  id: v4(),
                  name: row.Name,
                  active: parseBoolean(row.Active),
                  phone: row.Phone,
                  email: row.Email,
                  website: row.Website,
                  address1: row.Address,
                  address2: row['Apartment, suite, etc.'],
                  city: row.City,
                  state: row['State/Province'],
                  zip: row['Zip/Postal code'],
                  country: row.Country,
                  lat: parseFloat(row.Latitude),
                  lng: parseFloat(row.Longitude),
                  searchFilters: row['Search filters']
                    .split('|')
                    .map((untrimmedName) => {
                      const name = untrimmedName.trim();
                      const searchFilter = searchFilters.find(
                        (sf) => sf.name === name,
                      );

                      if (searchFilter) {
                        return searchFilter.id;
                      }
                      return null;
                    })
                    .filter((searchFilterId) => {
                      return searchFilterId !== null;
                    }),
                  customFieldValues: customFields.map((customField) => {
                    const header = getCustomFieldHeaderName(customField.name);
                    const value = row[header];
                    return { id: v4(), customFieldId: customField.id, value };
                  }),
                  customActionValues: customActions.map((customAction) => {
                    const header = getCustomActionHeaderName(customAction.name);
                    const value = row[header];
                    return { id: v4(), customActionId: customAction.id, value };
                  }),
                };
                const parsedRow = ParsedRow.safeParse(parseCandidate);

                if (parsedRow.success) {
                  parsedRows.push(parsedRow.data);
                } else {
                  const [issue] = parsedRow.error.issues;

                  let column: string = '';

                  if (
                    issue.path[0] === 'customFieldValues' &&
                    typeof issue.path[1] === 'number'
                  ) {
                    const { customFieldId } =
                      parseCandidate.customFieldValues[issue.path[1]];
                    const customField = customFields.find(
                      (cf) => cf.id === customFieldId,
                    );
                    if (customField) {
                      column = getCustomFieldHeaderName(customField.name);
                    }
                  } else if (
                    issue.path[0] === 'customActionValues' &&
                    typeof issue.path[1] === 'number'
                  ) {
                    const { customActionId } =
                      parseCandidate.customActionValues[issue.path[1]];
                    const customAction = customActions.find(
                      (ca) => ca.id === customActionId,
                    );
                    if (customAction) {
                      column = getCustomActionHeaderName(customAction.name);
                    }
                  } else {
                    column = parsedRowKeyToHeader[issue.path[0]];
                  }

                  if (column) {
                    parseErrors.push(
                      `Row ${index + 2}, column ${column}: ${issue.message.toLowerCase()}`,
                    );
                  } else {
                    parseErrors.push(
                      `Row ${index + 2}: ${issue.message.toLowerCase()}`,
                    );
                  }
                }
              });

              setState((prevState) => {
                return {
                  ...prevState,
                  parsedRows,
                  parseErrors,
                  parsed: true,
                };
              });

              if (parseErrors.length > 0) {
                return;
              }

              setState((prevState) => {
                return {
                  ...prevState,
                  geocodingStarted: true,
                  geocodingFinished: false,
                  geocodingErrors: [],
                };
              });

              const chunkSize = 20;
              const rowChunks = chunk(parsedRows, chunkSize);
              const geocoder = new geocodingLibrary.Geocoder();
              const rowsGeocoded: LocationsCreateManyInput = [];
              const rowsFailedToGeocode: number[] = [];

              for (let i = 0; i < rowChunks.length; i += 1) {
                const rowChunk = rowChunks[i];
                const promises = rowChunk.map(async (row, index) => {
                  if (row.lat !== null && row.lng !== null) {
                    // Row already contains latitude and longitude, no need to
                    // geocode
                    rowsGeocoded.push({
                      ...row,
                      lat: row.lat,
                      lng: row.lng,
                    });
                    return new Promise<void>((resolve) => {
                      resolve();
                    });
                  }

                  const address =
                    `${row.address1} ${row.city} ${row.state} ${row.zip} ${row.country}`.trim();

                  if (geocodingCache[address]) {
                    rowsGeocoded.push({
                      ...row,
                      lat: geocodingCache[address].lat,
                      lng: geocodingCache[address].lng,
                    });
                    return new Promise<void>((resolve) => {
                      resolve();
                    });
                  }

                  return new Promise<void>((resolve) => {
                    geocoder
                      .geocode({ address }, (results, status) => {
                        if (
                          !results ||
                          results.length === 0 ||
                          status !== geocodingLibrary.GeocoderStatus.OK
                        ) {
                          // Convert array index to csv file row number
                          rowsFailedToGeocode.push(i * chunkSize + index + 2);
                          return resolve();
                        }

                        const [firstResult] = results;

                        rowsGeocoded.push({
                          ...row,
                          lat: firstResult.geometry.location.lat(),
                          lng: firstResult.geometry.location.lng(),
                        });

                        geocodingCache[address] = {
                          lat: firstResult.geometry.location.lat(),
                          lng: firstResult.geometry.location.lng(),
                        };

                        return resolve();
                      })
                      .catch(() => {
                        // Do nothing here since we handle the error in the callback
                      });
                  });
                });

                // eslint-disable-next-line no-await-in-loop
                await Promise.all(promises);
              }

              rowsFailedToGeocode.sort((rowA, rowB) => {
                return rowA - rowB;
              });

              setState((prevState) => {
                return {
                  ...prevState,
                  rows: rowsGeocoded,
                  geocodingFinished: true,
                  geocodingErrors: rowsFailedToGeocode,
                };
              });
            }}
          >
            {state.file && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  gap: '10px',
                }}
              >
                <Thumbnail
                  size="small"
                  alt={state.file.name}
                  source={NoteIcon}
                />
                <div>
                  {state.file.name}{' '}
                  <Text variant="bodySm" as="p">
                    {state.file.size} bytes
                  </Text>
                </div>
                <div
                  onClick={(event) => {
                    event.stopPropagation();
                    setState((prevState) => {
                      return {
                        ...prevState,
                        file: null,
                        parsed: false,
                        parsedRows: [],
                        parseErrors: [],
                        rows: [],
                        geocodingStarted: false,
                        geocodingFinished: false,
                        geocodingErrors: [],
                        importStarted: false,
                        importFinished: false,
                        importError: false,
                      };
                    });
                  }}
                >
                  <Button>Remove</Button>
                </div>
              </div>
            )}
            {!state.file && <DropZone.FileUpload />}
          </DropZone>
        </Layout.Section>
        {state.parsed && state.parseErrors.length > 0 && (
          <Layout.Section>
            <Text as="p">There were errors found when parsing your file:</Text>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {state.parseErrors.map((error) => {
                return (
                  <Text key={error} tone="critical" as="p">
                    {error}
                  </Text>
                );
              })}
            </div>
          </Layout.Section>
        )}
        {state.parsed && state.parseErrors.length === 0 && (
          <Layout.Section>
            <Text as="p">
              Found {state.parsedRows.length} locations that can be imported.
            </Text>
          </Layout.Section>
        )}
        {state.geocodingStarted && !state.geocodingFinished && (
          <Layout.Section>
            <div style={{ display: 'flex', gap: '5px' }}>
              <Text as="p">Geocoding...</Text>
              <Spinner size="small" />
            </div>
          </Layout.Section>
        )}
        {state.geocodingFinished && state.geocodingErrors.length > 0 && (
          <Layout.Section>
            <Text as="p">Failed to geocode the following rows:</Text>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {state.geocodingErrors.map((row) => {
                return (
                  <Text key={row} as="p" tone="critical">
                    Row {row} failed to geocode
                  </Text>
                );
              })}
            </div>
            <Text as="p">
              Please double check the addresses, add the latitude and longitude
              or remove these rows.
            </Text>
          </Layout.Section>
        )}
        {state.geocodingFinished && state.geocodingErrors.length === 0 && (
          <Layout.Section>
            <Text as="p" tone="success">
              Geocoding complete. Ready for import.
            </Text>
          </Layout.Section>
        )}
        {state.importStarted && !state.importFinished && (
          <Layout.Section>
            <div style={{ display: 'flex', gap: '5px' }}>
              <Text as="p">Importing...</Text>
              <Spinner size="small" />
            </div>
          </Layout.Section>
        )}
        {state.importFinished && !state.importError && (
          <Layout.Section>
            <Text as="p" tone="success">
              Import complete.
            </Text>
          </Layout.Section>
        )}
        {state.importFinished && state.importError && (
          <Layout.Section>
            <Text as="p" tone="critical">
              Import failed. Please try again.
            </Text>
          </Layout.Section>
        )}
      </Layout>
    </Modal>
  );
};
