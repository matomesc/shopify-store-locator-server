import { router } from '../trpc';
import { billingRouter } from './billing';
import { customActionsRouter } from './customActions';
import { customFieldsRouter } from './customFields';
import { languagesRouter } from './languages';
import { locationsRouter } from './locations';
import { plansRouter } from './plans';
import { searchFiltersRouter } from './searchFilters';
import { settingsRouter } from './settings';
import { shopsRouter } from './shops';
import { translationsRouter } from './translations';

export const appRouter = router({
  shops: shopsRouter,
  billing: billingRouter,
  plans: plansRouter,
  locations: locationsRouter,
  settings: settingsRouter,
  searchFilters: searchFiltersRouter,
  customFields: customFieldsRouter,
  customActions: customActionsRouter,
  languages: languagesRouter,
  translations: translationsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
