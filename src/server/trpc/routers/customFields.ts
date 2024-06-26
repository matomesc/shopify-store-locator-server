import { prisma } from '@/server/lib/prisma';
import { CustomFieldsSyncInput } from '@/dto/trpc';
import { uniq } from 'lodash';
import { TRPCError } from '@trpc/server';
import { privateProcedure, router } from '../trpc';

export const customFieldsRouter = router({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const { shop } = ctx;

    const customFields = await prisma.customField.findMany({
      where: {
        shopId: shop.id,
      },
    });

    return {
      customFields,
    };
  }),
  sync: privateProcedure
    .input(CustomFieldsSyncInput)
    .mutation(async ({ ctx, input }) => {
      const { shop } = ctx;

      // Make sure that the custom field names are all unique
      if (uniq(input.map((i) => i.name)).length !== input.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'DuplicateCustomFieldName',
        });
      }

      return prisma.$transaction(
        async (tx) => {
          const currentCustomFields = await tx.customField.findMany({
            where: {
              shopId: shop.id,
            },
          });
          const currentCustomFieldIds = currentCustomFields.map((f) => f.id);
          const newCustomFields = input;
          const newCustomFieldsIds = newCustomFields.map((f) => f.id);

          // Delete custom fields
          const customFieldsToDelete = currentCustomFields.filter(
            (customField) => {
              return !newCustomFieldsIds.includes(customField.id);
            },
          );
          await tx.customField.deleteMany({
            where: {
              id: {
                in: customFieldsToDelete.map((f) => f.id),
              },
            },
          });

          // Create custom fields
          const customFieldsToCreate = newCustomFields.filter((filter) => {
            return !currentCustomFieldIds.includes(filter.id);
          });
          await tx.customField.createMany({
            data: customFieldsToCreate.map((customField) => {
              return {
                id: customField.id,
                name: customField.name,
                shopId: shop.id,
                position: customField.position,
                hideLabel: customField.hideLabel,
                labelPosition: customField.labelPosition,
                showInList: customField.showInList,
                showInMap: customField.showInMap,
                defaultValue: customField.defaultValue,
              };
            }),
          });

          // Update custom fields
          const customFieldsToUpdate = newCustomFields.filter((filter) => {
            return currentCustomFieldIds.includes(filter.id);
          });
          // eslint-disable-next-line no-restricted-syntax
          for (const customField of customFieldsToUpdate) {
            // eslint-disable-next-line no-await-in-loop
            await tx.customField.update({
              where: {
                id: customField.id,
              },
              data: {
                name: customField.name,
                position: customField.position,
                hideLabel: customField.hideLabel,
                labelPosition: customField.labelPosition,
                showInList: customField.showInList,
                showInMap: customField.showInMap,
                defaultValue: customField.defaultValue,
              },
            });
          }

          // Return new custom fields
          return {
            customFields: await tx.customField.findMany({
              where: {
                shopId: shop.id,
              },
            }),
          };
        },
        {
          isolationLevel: 'ReadCommitted',
        },
      );
    }),
});
