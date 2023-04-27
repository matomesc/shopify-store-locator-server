import crypto from 'crypto';
import { config } from '../config';

export function verifyShopifyRequest(
  query: Record<string, string | string[] | undefined>,
) {
  const { hmac, ...rest } = query;

  if (typeof hmac !== 'string') {
    return false;
  }

  const queryString = Object.keys(rest)
    .sort()
    .map((key) => {
      return `${key}=${String(rest[key])}`;
    })
    .join('&');

  const computedHmac = crypto
    .createHmac('sha256', config.SHOPIFY_CLIENT_SECRET)
    .update(queryString)
    .digest('hex');

  return hmac === computedHmac;
}

export function verifyShopifyWebhook(hmac: string, body: string) {
  const computedHmac = crypto
    .createHmac('sha256', config.SHOPIFY_CLIENT_SECRET)
    .update(body)
    .digest('base64');

  return hmac === computedHmac;
}

export function verifyScopes(actual: string, desired: string) {
  return (
    actual.split(',').sort().join(',') === desired.split(',').sort().join(',')
  );
}
