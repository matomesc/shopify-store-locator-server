import { prisma } from '@/server/lib/prisma';
import { TranslationsSyncInput } from '@/dto/trpc';
import { chunk } from 'lodash';
import { privateProcedure, router } from '../trpc';

export const translationsRouter = router({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const { shop } = ctx;

    const translations = await prisma.translation.findMany({
      where: {
        language: {
          shopId: shop.id,
        },
      },
    });

    return {
      translations,
    };
  }),
  sync: privateProcedure
    .input(TranslationsSyncInput)
    .mutation(({ ctx, input }) => {
      const { shop } = ctx;

      return prisma.$transaction(async (tx) => {
        const currentTranslations = await tx.translation.findMany({
          where: {
            language: {
              shopId: shop.id,
            },
          },
        });
        const currentTranslationIds = currentTranslations.map((t) => t.id);
        const newTranslations = input;
        const newTranslationsIds = newTranslations.map((t) => t.id);

        // Delete translations
        const translationsToDelete = currentTranslations.filter(
          (translation) => {
            return !newTranslationsIds.includes(translation.id);
          },
        );
        await tx.translation.deleteMany({
          where: {
            id: {
              in: translationsToDelete.map(({ id }) => id),
            },
          },
        });

        // Create translations
        const translationsToCreate = newTranslations.filter((translation) => {
          return !currentTranslationIds.includes(translation.id);
        });
        await tx.translation.createMany({
          data: translationsToCreate.map((translation) => {
            return {
              id: translation.id,
              languageId: translation.languageId,
              value: translation.value,
              target: translation.target,
              searchFilterId: translation.searchFilterId,
              customFieldId: translation.customFieldId,
              customActionId: translation.customActionId,
            };
          }),
        });

        // Update translations
        const translationsToUpdate = newTranslations.filter((translation) => {
          return currentTranslationIds.includes(translation.id);
        });
        const translationsToUpdateChunks = chunk(translationsToUpdate, 5);
        // eslint-disable-next-line no-restricted-syntax
        for (const translationsToUpdateChunk of translationsToUpdateChunks) {
          const promises = translationsToUpdateChunk.map((translation) => {
            return tx.translation.update({
              where: {
                id: translation.id,
              },
              data: {
                value: translation.value,
              },
            });
          });
          // eslint-disable-next-line no-await-in-loop
          await Promise.all(promises);
        }

        // Return new translations
        return {
          translations: await tx.translation.findMany({
            where: {
              language: {
                shopId: shop.id,
              },
            },
          }),
        };
      });
    }),
});
