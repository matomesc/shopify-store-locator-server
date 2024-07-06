import { CustomField, LocationsCreateInput } from '@/dto/trpc';
import { FormLayout, Link } from '@shopify/polaris';
import { Editor } from '../customFieldValues/Editor';

export interface CustomFieldValuesProps {
  customFields: CustomField[];
  customFieldValues: LocationsCreateInput['customFieldValues'];
  onChange: (
    customFieldValues: LocationsCreateInput['customFieldValues'],
  ) => void;
}

export const CustomFieldValues: React.FC<CustomFieldValuesProps> = ({
  customFields,
  customFieldValues,
  onChange,
}) => {
  return (
    <FormLayout>
      {customFieldValues
        .map((customFieldValue) => {
          const customField = customFields.find(
            (cf) => cf.id === customFieldValue.customFieldId,
          );

          if (!customField) {
            return null;
          }

          return {
            customField,
            customFieldValue,
          };
        })
        .filter((value) => {
          return !!value;
        })
        .sort((valueA, valueB) => {
          if (valueA.customField.name < valueB.customField.name) {
            return -1;
          }
          if (valueA.customField.name > valueB.customField.name) {
            return 1;
          }
          return 0;
        })
        .map((value) => {
          return (
            <Editor
              key={value.customFieldValue.id}
              label={value.customField.name}
              value={value.customFieldValue.value}
              onChange={(newValue) => {
                onChange(
                  customFieldValues.map((cfv) => {
                    if (cfv.id === value.customFieldValue.id) {
                      return {
                        ...value.customFieldValue,
                        value: newValue,
                      };
                    }
                    return cfv;
                  }),
                );
              }}
            />
          );
        })}
      <p>
        You can manage your custom fields on the{' '}
        <Link url="/settings">settings page</Link>
      </p>
    </FormLayout>
  );
};
