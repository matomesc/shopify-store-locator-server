import * as trpcNext from '@trpc/server/adapters/next';
import * as Sentry from '@sentry/nextjs';
import { createContext } from '../../../server/trpc/context';
import { appRouter } from '../../../server/trpc/routers/_app';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  allowMethodOverride: true,
  createContext,
  onError: ({ error }) => {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      Sentry.captureException(error);
    }
  },
});
