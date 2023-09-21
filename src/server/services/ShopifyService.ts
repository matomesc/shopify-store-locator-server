import got from 'got';
import { singleton } from 'tsyringe';
import { z } from 'zod';
import { config } from '../config';

const ExchangeCodeForAccessTokenResponse = z.object({
  access_token: z.string(),
  scope: z.string(),
});

const GetWebhooksResponse = z.object({
  webhooks: z.array(
    z.object({
      id: z.number(),
      address: z.string(),
      topic: z.string(),
    }),
  ),
});

@singleton()
export class ShopifyService {
  public async exchangeCodeForAccessToken({
    shopDomain,
    code,
  }: {
    shopDomain: string;
    code: string;
  }) {
    const cliendId = config.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
    const clientSecret = config.SHOPIFY_CLIENT_SECRET;
    const json = await got
      .post(
        `https://${shopDomain}/admin/oauth/access_token?client_id=${cliendId}&client_secret=${clientSecret}&code=${code}`,
      )
      .json();

    const parsed = ExchangeCodeForAccessTokenResponse.parse(json);
    return parsed;
  }

  public async getWebhooks({
    shopDomain,
    accessToken,
  }: {
    shopDomain: string;
    accessToken: string;
  }) {
    const json = await got
      .get(
        `https://${shopDomain}/admin/api/${config.SHOPIFY_API_VERSION}/webhooks.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
          },
        },
      )
      .json();

    const parsed = GetWebhooksResponse.parse(json);
    return parsed;
  }

  public async createWebhook({
    shopDomain,
    accessToken,
    topic,
  }: {
    shopDomain: string;
    accessToken: string;
    topic: string;
  }) {
    await got.post(
      `https://${shopDomain}/admin/api/${config.SHOPIFY_API_VERSION}/webhooks.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
        json: {
          webhook: {
            topic,
            address: `${config.BASE_URL}/api/webhooks`,
            format: 'json',
          },
        },
      },
    );
  }
}
