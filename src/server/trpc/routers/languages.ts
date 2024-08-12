import { LanguagesSyncInput } from '@/dto/trpc';
import { prisma } from '@/server/lib/prisma';
import { chunk, uniq } from 'lodash';
import { TRPCError } from '@trpc/server';
import { privateProcedure, router } from '../trpc';

export const languagesRouter = router({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const { shop } = ctx;

    const languages = await prisma.language.findMany({
      where: {
        shopId: shop.id,
      },
    });

    return {
      languages,
    };
  }),
  sync: privateProcedure
    .input(LanguagesSyncInput)
    .mutation(async ({ ctx, input }) => {
      const { shop } = ctx;

      // Make sure the language codes are unique
      if (uniq(input.map((i) => i.code)).length !== input.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'DuplicateLanguageCode',
        });
      }

      return prisma.$transaction(async (tx) => {
        const currentLanguages = await tx.language.findMany({
          where: {
            shopId: shop.id,
          },
        });
        const currentLanguagesIds = currentLanguages.map(
          (language) => language.id,
        );
        const newLanguages = input;
        const newLanguagesIds = newLanguages.map((language) => language.id);

        // Delete languages
        const languagesToDelete = currentLanguages.filter((language) => {
          return !newLanguagesIds.includes(language.id);
        });
        await tx.language.deleteMany({
          where: {
            id: {
              in: languagesToDelete.map(({ id }) => id),
            },
          },
        });

        // Create langauges
        const languagesToCreate = newLanguages.filter((language) => {
          return !currentLanguagesIds.includes(language.id);
        });
        await tx.language.createMany({
          data: languagesToCreate.map((language) => {
            return {
              id: language.id,
              shopId: shop.id,
              code: language.code,
              enabled: language.enabled,
              createdAt: language.createdAt,
            };
          }),
        });

        // Update langauges
        const languagesToUpdate = newLanguages.filter((language) => {
          return currentLanguagesIds.includes(language.id);
        });
        const languagesToUpdateChunks = chunk(languagesToUpdate, 5);
        // eslint-disable-next-line no-restricted-syntax
        for (const languagesToUpdateChunk of languagesToUpdateChunks) {
          const promises = languagesToUpdateChunk.map((language) => {
            return tx.language.update({
              where: {
                id: language.id,
              },
              data: {
                code: language.code,
                enabled: language.enabled,
              },
            });
          });
          // eslint-disable-next-line no-await-in-loop
          await Promise.all(promises);
        }

        return {
          languages: await tx.language.findMany({
            where: {
              shopId: shop.id,
            },
          }),
        };
      });
    }),
});
