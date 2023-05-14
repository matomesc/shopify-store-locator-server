# Shopify NextJS Starter

## Shopify configuration

Configure the Shopify app:

- In URLs
  - App URL: `{BASE_URL}/dashboard`
  - Preferences URL: `{BASE_URL}/settings`
  - Allowed redirection URLs: `{BASE_URL}/api/auth/callback`
- In GDPR mandatory webhooks
  - Customer data request endpoint: `{BASE_URL}/api/webhooks`
  - Customer data erasure endpoint: `{BASE_URL}/api/webhooks`
  - Shop data erasure endpoint: `{BASE_URL}/api/webhooks`
- In Protected customer data access (optional, only if required):
  - Protected customer data: `App functionality`
  - Protected customer fields: `Name` `Email` `Phone` `Address`
  - Provide your data protection details: complete this section
