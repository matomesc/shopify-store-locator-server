import { prisma } from '@/server/lib/prisma';
import { SearchFiltersSyncInput } from '@/dto/trpc';
import { TRPCError } from '@trpc/server';
import { chunk, uniq } from 'lodash';
import { privateProcedure, router } from '../trpc';

export const searchFiltersRouter = router({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const { shop } = ctx;

    const searchFilters = await prisma.searchFilter.findMany({
      where: {
        shopId: shop.id,
      },
    });

    return {
      searchFilters,
    };
  }),
  sync: privateProcedure
    .input(SearchFiltersSyncInput)
    .mutation(async ({ ctx, input }) => {
      const { shop } = ctx;

      // Make sure that the search filter names are all unique
      if (uniq(input.map((i) => i.name)).length !== input.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'DuplicateSearchFilterName',
        });
      }

      return prisma.$transaction(
        async (tx) => {
          const currentSearchFilters = await tx.searchFilter.findMany({
            where: {
              shopId: shop.id,
            },
          });
          const currentSearchFilterIds = currentSearchFilters.map((f) => f.id);
          const newSearchFilters = input;
          const newSearchFiltersIds = newSearchFilters.map((f) => f.id);

          // Delete filters
          const filtersToDelete = currentSearchFilters.filter((filter) => {
            return !newSearchFiltersIds.includes(filter.id);
          });
          await tx.searchFilter.deleteMany({
            where: {
              id: {
                in: filtersToDelete.map((f) => f.id),
              },
            },
          });

          // Create filters
          const filtersToCreate = newSearchFilters.filter((filter) => {
            return !currentSearchFilterIds.includes(filter.id);
          });
          await tx.searchFilter.createMany({
            data: filtersToCreate.map((filter) => {
              return {
                id: filter.id,
                name: filter.name,
                shopId: shop.id,
                position: filter.position,
                enabled: filter.enabled,
                showInList: filter.showInList,
                showInMap: filter.showInMap,
              };
            }),
          });

          // Update filters
          const filtersToUpdate = newSearchFilters.filter((filter) => {
            return currentSearchFilterIds.includes(filter.id);
          });
          const filtersToUpdateChunks = chunk(filtersToUpdate, 5);
          // eslint-disable-next-line no-restricted-syntax
          for (const filtersToUpdateChunk of filtersToUpdateChunks) {
            // eslint-disable-next-line no-await-in-loop
            await Promise.all(
              filtersToUpdateChunk.map((filter) => {
                return tx.searchFilter.update({
                  where: {
                    id: filter.id,
                  },
                  data: {
                    name: filter.name,
                    position: filter.position,
                    enabled: filter.enabled,
                    showInList: filter.showInList,
                    showInMap: filter.showInMap,
                  },
                });
              }),
            );
          }

          // Return new search filters
          return {
            searchFilters: await tx.searchFilter.findMany({
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
