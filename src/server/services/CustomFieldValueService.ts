import { LocationsCreateInput } from '@/dto/trpc';
import { Prisma } from '@prisma/client';
import { chunk } from 'lodash';
import { singleton } from 'tsyringe';
import { v4 } from 'uuid';

@singleton()
export class CustomFieldValueService {
  public async sync({
    shopId,
    locationId,
    data,
    tx,
  }: {
    shopId: string;
    locationId: string;
    data: LocationsCreateInput['customFieldValues'];
    tx: Prisma.TransactionClient;
  }) {
    const currentCustomFieldValues = await tx.customFieldValue.findMany({
      where: {
        locationId,
      },
    });
    const currentCustomFieldValuesIds = currentCustomFieldValues.map(
      (c) => c.id,
    );
    const customFields = await tx.customField.findMany({
      where: {
        shopId,
      },
    });
    const customFieldsIds = customFields.map((customField) => customField.id);
    let newCustomFieldValues = data.filter((customFieldValue) => {
      return customFieldsIds.includes(customFieldValue.customFieldId);
    });
    newCustomFieldValues = [
      ...newCustomFieldValues,
      // Add missing custom field values for custom fields
      ...customFieldsIds
        .filter((customFieldId) => {
          return !newCustomFieldValues.find(
            (cfv) => cfv.customFieldId === customFieldId,
          );
        })
        .map((customFieldId) => {
          return {
            id: v4(),
            value: '',
            customFieldId,
          };
        }),
    ];
    const newCustomFieldValuesIds = newCustomFieldValues.map((c) => c.id);

    // Delete custom field values
    const customFieldValuesToDelete = currentCustomFieldValues.filter(
      (customFieldValue) => {
        return !newCustomFieldValuesIds.includes(customFieldValue.id);
      },
    );
    await tx.customFieldValue.deleteMany({
      where: {
        id: {
          in: customFieldValuesToDelete.map((c) => c.id),
        },
      },
    });

    // Create custom field values
    const customFieldValuesToCreate = newCustomFieldValues.filter(
      (customFieldValue) => {
        return !currentCustomFieldValuesIds.includes(customFieldValue.id);
      },
    );
    await tx.customFieldValue.createMany({
      data: customFieldValuesToCreate.map((customFieldValue) => {
        return {
          id: customFieldValue.id,
          customFieldId: customFieldValue.customFieldId,
          locationId,
          value: customFieldValue.value,
        };
      }),
    });

    // Update custom field values
    const customFieldValuesToUpdate = newCustomFieldValues.filter(
      (customFieldValue) => {
        return currentCustomFieldValuesIds.includes(customFieldValue.id);
      },
    );
    const customFieldValuesToUpdateChunks = chunk(customFieldValuesToUpdate, 5);
    // eslint-disable-next-line no-restricted-syntax
    for (const customFieldValuesToUpdateChunk of customFieldValuesToUpdateChunks) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(
        customFieldValuesToUpdateChunk.map((customFieldValue) => {
          return tx.customFieldValue.update({
            where: {
              id: customFieldValue.id,
            },
            data: {
              value: customFieldValue.value,
            },
          });
        }),
      );
    }
  }
}
