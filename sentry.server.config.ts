// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { config } from './src/server/config';

Sentry.init({
  dsn: config.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: config.NEXT_PUBLIC_APP_ENV === 'development' ? 1 : 0.05,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',

  normalizeDepth: 10,
  environment: config.NEXT_PUBLIC_APP_ENV,
  integrations: [Sentry.extraErrorDataIntegration({ depth: 10 })],
});
