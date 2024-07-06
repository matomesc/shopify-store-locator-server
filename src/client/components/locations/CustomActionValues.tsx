import { CustomAction, LocationsCreateInput } from '@/dto/trpc';
import { Badge, FormLayout, Link, TextField } from '@shopify/polaris';

export interface CustomActionValuesProps {
  customActions: CustomAction[];
  customActionValues: LocationsCreateInput['customActionValues'];
  onChange: (value: LocationsCreateInput['customActionValues']) => void;
}

export const CustomActionValues: React.FC<CustomActionValuesProps> = ({
  customActions,
  customActionValues,
  onChange,
}) => {
  return (
    <FormLayout>
      {customActionValues
        .map((customActionValue) => {
          const customAction = customActions.find(
            (ca) => ca.id === customActionValue.customActionId,
          );

          if (!customAction) {
            return null;
          }

          return { customAction, customActionValue };
        })
        .filter((v) => !!v)
        .sort((valueA, valueB) => {
          if (valueA.customAction.name < valueB.customAction.name) {
            return -1;
          }
          if (valueA.customAction.name > valueB.customAction.name) {
            return 1;
          }
          return 0;
        })
        .map((value) => {
          return (
            <TextField
              key={value.customActionValue.id}
              autoComplete="off"
              value={value.customActionValue.value}
              label={
                <div>
                  {value.customAction.name}{' '}
                  <Badge tone="success">
                    {value.customAction.type === 'link' ? 'Link' : 'JavaScript'}
                  </Badge>
                </div>
              }
              multiline={value.customAction.type === 'js' ? 3 : false}
              placeholder={
                value.customAction.type === 'link' ? 'https://example.com' : ''
              }
              onChange={(v) => {
                onChange(
                  customActionValues.map((c) => {
                    if (c.id === value.customActionValue.id) {
                      return {
                        ...value.customActionValue,
                        value: v,
                      };
                    }
                    return c;
                  }),
                );
              }}
            />
          );
        })}
      <p>
        You can manage your custom actions on the{' '}
        <Link url="/settings">settings page</Link>
      </p>
    </FormLayout>
  );
};
