import { SearchFilter } from '@/dto/trpc';
import { Button, ButtonGroup, Checkbox, Link } from '@shopify/polaris';
import { useMemo } from 'react';

export interface SearchFiltersProps {
  searchFilters: SearchFilter[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchFilters,
  selected,
  onChange,
}) => {
  const sortedSearchFilters = useMemo(() => {
    return searchFilters.sort((searchFilterA, searchFilterB) => {
      if (searchFilterA.name < searchFilterB.name) {
        return -1;
      }
      if (searchFilterA.name > searchFilterB.name) {
        return 1;
      }
      return 0;
    });
  }, [searchFilters]);
  return (
    <div>
      {sortedSearchFilters.length > 0 && (
        <div style={{ marginBottom: '5px' }}>
          <ButtonGroup>
            <Button
              onClick={() => {
                onChange(searchFilters.map((sf) => sf.id));
              }}
            >
              Enable all
            </Button>
            <Button
              onClick={() => {
                onChange([]);
              }}
            >
              Disable all
            </Button>
          </ButtonGroup>
        </div>
      )}
      {sortedSearchFilters.length > 0 && sortedSearchFilters.length <= 10 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sortedSearchFilters.map((searchFilter) => {
            return (
              <Checkbox
                key={searchFilter.id}
                label={searchFilter.name}
                checked={selected.includes(searchFilter.id)}
                onChange={(checked) => {
                  if (checked && !selected.includes(searchFilter.id)) {
                    onChange([...selected, searchFilter.id]);
                  } else if (!checked) {
                    onChange(selected.filter((id) => id !== searchFilter.id));
                  }
                }}
              />
            );
          })}
        </div>
      )}
      {sortedSearchFilters.length > 10 && (
        <div style={{ display: 'flex' }}>
          <div
            style={{
              flexBasis: '200px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {sortedSearchFilters
              .slice(0, Math.ceil(sortedSearchFilters.length / 2))
              .map((searchFilter) => {
                return (
                  <Checkbox
                    key={searchFilter.id}
                    label={searchFilter.name}
                    checked={selected.includes(searchFilter.id)}
                    onChange={(checked) => {
                      if (checked && !selected.includes(searchFilter.id)) {
                        onChange([...selected, searchFilter.id]);
                      } else if (!checked) {
                        onChange(
                          selected.filter((id) => id !== searchFilter.id),
                        );
                      }
                    }}
                  />
                );
              })}
          </div>
          <div
            style={{
              flexBasis: '200px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {sortedSearchFilters
              .slice(Math.ceil(sortedSearchFilters.length / 2))
              .map((searchFilter) => {
                return (
                  <Checkbox
                    key={searchFilter.id}
                    label={searchFilter.name}
                    checked={selected.includes(searchFilter.id)}
                    onChange={(checked) => {
                      if (checked && !selected.includes(searchFilter.id)) {
                        onChange([...selected, searchFilter.id]);
                      } else if (!checked) {
                        onChange(
                          selected.filter((id) => id !== searchFilter.id),
                        );
                      }
                    }}
                  />
                );
              })}
          </div>
        </div>
      )}
      <p>
        You can manage your search filters on the{' '}
        <Link url="/settings">settings page</Link>
      </p>
    </div>
  );
};
