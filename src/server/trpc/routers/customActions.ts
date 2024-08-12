import { prisma } from '@/server/lib/prisma';
import { CustomActionsSyncInput } from '@/dto/trpc';
import { chunk, uniq } from 'lodash';
import { TRPCError } from '@trpc/server';
import { v4 } from 'uuid';
import { privateProcedure, router } from '../trpc';

export const customActionsRouter = router({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const { shop } = ctx;

    const customActions = await prisma.customAction.findMany({
      where: {
        shopId: shop.id,
      },
    });

    return {
      customActions,
    };
  }),
  sync: privateProcedure
    .input(CustomActionsSyncInput)
    .mutation(async ({ ctx, input }) => {
      const { shop } = ctx;

      // Make sure that the custom action names are all unique
      if (uniq(input.map((i) => i.name)).length !== input.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'DuplicateCustomActionName',
        });
      }

      return prisma.$transaction(
        async (tx) => {
          const currentCustomActions = await tx.customAction.findMany({
            where: {
              shopId: shop.id,
            },
          });
          const currentCustomActionIds = currentCustomActions.map((f) => f.id);
          const newCustomActions = input;
          const newCustomActionsIds = newCustomActions.map((f) => f.id);

          // Delete custom actions
          const customActionsToDelete = currentCustomActions.filter(
            (customAction) => {
              return !newCustomActionsIds.includes(customAction.id);
            },
          );
          await tx.customAction.deleteMany({
            where: {
              id: {
                in: customActionsToDelete.map(({ id }) => id),
              },
            },
          });

          // Create custom actions
          const customActionsToCreate = newCustomActions.filter(
            (customAction) => {
              return !currentCustomActionIds.includes(customAction.id);
            },
          );
          await tx.customAction.createMany({
            data: customActionsToCreate.map((customAction) => {
              return {
                id: customAction.id,
                type: customAction.type,
                name: customAction.name,
                shopId: shop.id,
                position: customAction.position,
                enabled: customAction.enabled,
                showInList: customAction.showInList,
                showInMap: customAction.showInMap,
                defaultValue: customAction.defaultValue,
                openInNewTab: customAction.openInNewTab,
              };
            }),
          });
          const locations = await tx.location.findMany({
            where: {
              shopId: shop.id,
            },
          });
          // Create custom action values
          await tx.customActionValue.createMany({
            data: locations.flatMap((location) => {
              return customActionsToCreate.map((customAction) => {
                return {
                  id: v4(),
                  value: '',
                  locationId: location.id,
                  customActionId: customAction.id,
                };
              });
            }),
          });

          // Update custom actions
          const customActionsToUpdate = newCustomActions.filter(
            (customAction) => {
              return currentCustomActionIds.includes(customAction.id);
            },
          );
          const customActionsToUpdateChunks = chunk(customActionsToUpdate, 5);
          // eslint-disable-next-line no-restricted-syntax
          for (const customActionsToUpdateChunk of customActionsToUpdateChunks) {
            // eslint-disable-next-line no-await-in-loop
            await Promise.all(
              customActionsToUpdateChunk.map((customAction) => {
                return tx.customAction.update({
                  where: {
                    id: customAction.id,
                  },
                  data: {
                    type: customAction.type,
                    name: customAction.name,
                    position: customAction.position,
                    enabled: customAction.enabled,
                    showInList: customAction.showInList,
                    showInMap: customAction.showInMap,
                    defaultValue: customAction.defaultValue,
                    openInNewTab: customAction.openInNewTab,
                  },
                });
              }),
            );
          }

          // Return new custom actions
          return {
            customActions: await tx.customAction.findMany({
              where: {
                shopId: shop.id,
              },
            }),
          };
        },
        { isolationLevel: 'ReadCommitted' },
      );
    }),
});
