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

## Heroku configuration

First modify the `start` npm command to use the `$PORT` env variable:

```js
scripts: {
  // ...
  start: node --require reflect-metadata ./node_modules/.bin/next start -p $PORT
  // ...
}
```

Next add a `Procfile` containing:

```shell
web: yarn start
release: yarn prisma migrate deploy
```

Next ensure that `engines.node` is set in package.json:

```js
"engines": {
  "node": "20.x"
}
```

Finally, set the `cacheDirectories`:

```js
"cacheDirectories": [".next/cache"]
```
