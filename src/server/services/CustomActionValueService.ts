import { LocationsCreateInput } from '@/dto/trpc';
import { Prisma } from '@prisma/client';
import { chunk } from 'lodash';
import { singleton } from 'tsyringe';
import { v4 } from 'uuid';

@singleton()
export class CustomActionValueService {
  public async sync({
    shopId,
    locationId,
    data,
    tx,
  }: {
    shopId: string;
    locationId: string;
    data: LocationsCreateInput['customActionValues'];
    tx: Prisma.TransactionClient;
  }) {
    const currentCustomActionValues = await tx.customActionValue.findMany({
      where: {
        locationId,
      },
    });
    const currentCustomActionValuesIds = currentCustomActionValues.map(
      (c) => c.id,
    );
    const customActions = await tx.customAction.findMany({
      where: {
        shopId,
      },
    });
    const customActionsIds = customActions.map((ca) => ca.id);
    let newCustomActionValues = data.filter((customActionValue) => {
      return customActionsIds.includes(customActionValue.customActionId);
    });

    newCustomActionValues = [
      ...newCustomActionValues,
      ...customActionsIds
        .filter((customActionId) => {
          return !newCustomActionValues.find(
            (customActionValue) =>
              customActionValue.customActionId === customActionId,
          );
        })
        .map((customActionId) => {
          return {
            id: v4(),
            value: '',
            customActionId,
          };
        }),
    ];

    const newCustomActionValuesIds = newCustomActionValues.map((c) => c.id);

    // Delete custom action values
    const customActionValuesToDelete = currentCustomActionValues.filter(
      (customActionValue) => {
        return !newCustomActionValuesIds.includes(customActionValue.id);
      },
    );
    await tx.customActionValue.deleteMany({
      where: {
        id: {
          in: customActionValuesToDelete.map((c) => c.id),
        },
      },
    });

    // Create custom action values
    const customActionValuesToCreate = newCustomActionValues.filter(
      (customActionValue) => {
        return !currentCustomActionValuesIds.includes(customActionValue.id);
      },
    );
    await tx.customActionValue.createMany({
      data: customActionValuesToCreate.map((customActionValue) => {
        return {
          id: customActionValue.id,
          customActionId: customActionValue.customActionId,
          locationId,
          value: customActionValue.value,
        };
      }),
    });

    // Update custom action values
    const customActionValuesToUpdate = newCustomActionValues.filter(
      (customActionValue) => {
        return currentCustomActionValuesIds.includes(customActionValue.id);
      },
    );
    const customActionValuesToUpdateChunks = chunk(
      customActionValuesToUpdate,
      5,
    );
    // eslint-disable-next-line no-restricted-syntax
    for (const customActionValuesToUpdateChunk of customActionValuesToUpdateChunks) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(
        customActionValuesToUpdateChunk.map((customActionValue) => {
          return tx.customActionValue.update({
            where: {
              id: customActionValue.id,
            },
            data: {
              value: customActionValue.value,
            },
          });
        }),
      );
    }
  }
}
