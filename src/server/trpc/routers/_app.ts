import { router } from '../trpc';
import { billingRouter } from './billing';
import { locationsRouter } from './locations';
import { plansRouter } from './plans';
import { settingsRouter } from './settings';
import { shopsRouter } from './shops';

export const appRouter = router({
  shops: shopsRouter,
  billing: billingRouter,
  plans: plansRouter,
  locations: locationsRouter,
  settings: settingsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
