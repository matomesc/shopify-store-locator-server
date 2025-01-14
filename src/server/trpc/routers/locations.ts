import { prisma } from '@/server/lib/prisma';
import {
  LocationsCreateInput,
  LocationsCreateManyInput,
  LocationsDeleteInput,
  LocationsDeleteManyInput,
  LocationsGetByIdInput,
  LocationsUpdateInput,
} from '@/dto/trpc';
import { TRPCError } from '@trpc/server';
import { v4 } from 'uuid';
import { container } from 'tsyringe';
import { CustomActionValueService } from '@/server/services/CustomActionValueService';
import { CustomFieldValueService } from '@/server/services/CustomFieldValueService';
import { chunk } from 'lodash';
import { privateProcedure, router } from '../trpc';

export const locationsRouter = router({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const { shop } = ctx;
    const locations = await prisma.location.findMany({
      where: {
        shopId: shop.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        searchFilters: {
          select: {
            id: true,
          },
        },
        customFieldValues: {
          select: {
            id: true,
            value: true,
            customFieldId: true,
          },
        },
        customActionValues: {
          select: {
            id: true,
            value: true,
            customActionId: true,
          },
        },
      },
    });

    return {
      locations,
    };
  }),
  getById: privateProcedure
    .input(LocationsGetByIdInput)
    .query(async ({ input }) => {
      const location = await prisma.location.findFirst({
        where: {
          id: input.id,
        },
        include: {
          searchFilters: true,
          customFieldValues: true,
          customActionValues: true,
        },
      });

      if (!location) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'LocationNotFound' });
      }

      return {
        location,
      };
    }),
  create: privateProcedure
    .input(LocationsCreateInput)
    .mutation(async ({ ctx, input }) => {
      const { shop } = ctx;

      // Build custom field values
      const customFields = await prisma.customField.findMany({
        where: {
          shopId: shop.id,
        },
      });
      const customFieldsIds = customFields.map((cf) => cf.id);
      let newCustomFieldValues = input.customFieldValues.filter(
        (customFieldValue) => {
          return customFieldsIds.includes(customFieldValue.customFieldId);
        },
      );
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

      // Build custom action values
      const customActions = await prisma.customAction.findMany({
        where: {
          shopId: shop.id,
        },
      });
      const customActionsIds = customActions.map((c) => c.id);
      let newCustomActionValues = input.customActionValues.filter(
        (customActionValue) => {
          return customActionsIds.includes(customActionValue.customActionId);
        },
      );
      newCustomActionValues = [
        ...newCustomActionValues,
        ...customActionsIds
          .filter((customActionId) => {
            return !newCustomActionValues.find(
              (c) => c.customActionId === customActionId,
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

      const location = await prisma.location.create({
        data: {
          id: input.id,
          name: input.name,
          active: input.active,
          email: input.email,
          phone: input.phone,
          website: input.website,
          address1: input.address1,
          address2: input.address2,
          city: input.city,
          state: input.state,
          zip: input.zip,
          country: input.country,
          lat: input.lat,
          lng: input.lng,
          shopId: shop.id,
          searchFilters: {
            connect: input.searchFilters.map((sf) => {
              return { id: sf };
            }),
          },
          customFieldValues: {
            createMany: {
              data: newCustomFieldValues,
            },
          },
          customActionValues: {
            createMany: {
              data: newCustomActionValues,
            },
          },
        },
        include: {
          searchFilters: true,
          customFieldValues: true,
          customActionValues: true,
        },
      });

      return {
        location,
      };
    }),
  update: privateProcedure
    .input(LocationsUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const { shop } = ctx;

      return prisma.$transaction(async (tx) => {
        let location = await tx.location.findFirst({
          where: {
            id: input.id,
            shopId: shop.id,
          },
        });

        if (!location) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'LocationNotFound',
          });
        }

        location = await tx.location.update({
          where: {
            id: location.id,
          },
          data: {
            name: input.name,
            active: input.active,
            email: input.email,
            phone: input.phone,
            website: input.website,
            address1: input.address1,
            address2: input.address2,
            city: input.city,
            state: input.state,
            zip: input.zip,
            country: input.country,
            lat: input.lat,
            lng: input.lng,
            shopId: shop.id,
            searchFilters: {
              set: input.searchFilters.map((sf) => {
                return { id: sf };
              }),
            },
          },
        });

        // Sync custom field values
        const customFieldValueService = container.resolve(
          CustomFieldValueService,
        );
        await customFieldValueService.sync({
          shopId: shop.id,
          locationId: location.id,
          data: input.customFieldValues,
          tx,
        });

        // Sync custom action values
        const customActionValueService = container.resolve(
          CustomActionValueService,
        );
        await customActionValueService.sync({
          shopId: shop.id,
          locationId: location.id,
          data: input.customActionValues,
          tx,
        });

        const updatedLocation = await tx.location.findFirst({
          where: {
            id: location.id,
          },
          include: {
            searchFilters: true,
            customFieldValues: true,
            customActionValues: true,
          },
        });

        if (!updatedLocation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'UpdatedLocationNotFound',
          });
        }

        return {
          location: updatedLocation,
        };
      });
    }),
  delete: privateProcedure
    .input(LocationsDeleteInput)
    .mutation(async ({ ctx, input }) => {
      const { shop } = ctx;
      const location = await prisma.location.findFirst({
        where: {
          id: input.id,
          shopId: shop.id,
        },
      });

      if (!location) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'LocationNotFound' });
      }

      await prisma.location.delete({
        where: {
          id: location.id,
        },
      });
    }),
  deleteMany: privateProcedure
    .input(LocationsDeleteManyInput)
    .mutation(async ({ ctx, input }) => {
      const { shop } = ctx;

      // This won't throw if no locations are matched
      await prisma.location.deleteMany({
        where: {
          id: {
            in: input.ids,
          },
          shopId: shop.id,
        },
      });
    }),
  createMany: privateProcedure
    .input(LocationsCreateManyInput)
    .mutation(async ({ ctx, input }) => {
      const { shop } = ctx;

      await prisma.$transaction(
        async (tx) => {
          const customFields = await tx.customField.findMany({
            where: {
              shopId: shop.id,
            },
          });
          const customFieldsIds = customFields.map((cf) => cf.id);
          const customActions = await tx.customAction.findMany({
            where: {
              shopId: shop.id,
            },
          });
          const customActionsIds = customActions.map((ca) => ca.id);
          const inputChunks = chunk(input, 5);

          // eslint-disable-next-line no-restricted-syntax
          for (const inputChunk of inputChunks) {
            const promises = inputChunk.map(async (data) => {
              // Build custom field values
              let newCustomFieldValues = data.customFieldValues.filter(
                (customFieldValue) => {
                  return customFieldsIds.includes(
                    customFieldValue.customFieldId,
                  );
                },
              );
              newCustomFieldValues = [
                ...newCustomFieldValues,
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

              // Build custom action values
              let newCustomActionValues = data.customActionValues.filter(
                (customActionValue) => {
                  return customActionsIds.includes(
                    customActionValue.customActionId,
                  );
                },
              );
              newCustomActionValues = [
                ...newCustomActionValues,
                ...customActionsIds
                  .filter((customActionId) => {
                    return !newCustomActionValues.find(
                      (c) => c.customActionId === customActionId,
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

              await tx.location.create({
                data: {
                  id: data.id,
                  name: data.name,
                  active: data.active,
                  email: data.email,
                  phone: data.phone,
                  website: data.website,
                  address1: data.address1,
                  address2: data.address2,
                  city: data.city,
                  state: data.state,
                  zip: data.zip,
                  country: data.country,
                  lat: data.lat,
                  lng: data.lng,
                  shopId: shop.id,
                  searchFilters: {
                    connect: data.searchFilters.map((sf) => {
                      return { id: sf };
                    }),
                  },
                  customFieldValues: {
                    createMany: {
                      data: newCustomFieldValues,
                    },
                  },
                  customActionValues: {
                    createMany: {
                      data: newCustomActionValues,
                    },
                  },
                },
              });
            });
            // eslint-disable-next-line no-await-in-loop
            await Promise.all(promises);
          }
        },
        { isolationLevel: 'ReadCommitted' },
      );
    }),
  count: privateProcedure.query(async ({ ctx }) => {
    const { shop } = ctx;

    const count = await prisma.location.count({
      where: {
        shopId: shop.id,
        active: true,
      },
    });

    return {
      count,
    };
  }),
});
