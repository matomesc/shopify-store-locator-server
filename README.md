# Shopify NextJS Starter

## Development

### Commiting

Commit your changes using `yarn commit` and answer the comitizen prompt.

### Upgrading @shopify/polaris

When upgrading `@shopify/polaris` don't forget to:

- run `yarn build` to type check the project
- verify `@shopify/polaris` css tokens usage by searching for the string `--p-` and ensuring
  it exists on <https://polaris.shopify.com/tokens>

## Shopify configuration

Configure the Shopify app:

- In URLs
  - App URL: `{BASE_URL}/dashboard`
  - Preferences URL: `{BASE_URL}/settings`
  - Allowed redirection URLs: `{BASE_URL}/api/shopify/auth/callback`
- In GDPR mandatory webhooks
  - Customer data request endpoint: `{BASE_URL}/api/shopify/webhooks`
  - Customer data erasure endpoint: `{BASE_URL}/api/shopify/webhooks`
  - Shop data erasure endpoint: `{BASE_URL}/api/shopify/webhooks`
- In Protected customer data access (optional, only if required):
  - Protected customer data: `App functionality`
  - Protected customer fields: `Name` `Email` `Phone` `Address`
  - Provide your data protection details: complete this section
