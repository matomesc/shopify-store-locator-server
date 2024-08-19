import { singleton } from 'tsyringe';
import { z } from 'zod';
import { Plan } from '@prisma/client';
import { config } from '../config';

const ExchangeCodeForAccessTokenResponse = z.object({
  access_token: z.string(),
  scope: z.string(),
});

const GetShopResponse = z.object({
  shop: z
    .object({
      name: z.string(),
      email: z.string(),
      iana_timezone: z.string(),
      shop_owner: z.string(),
    })
    .passthrough(),
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

const CreateRecurringApplicationChargeResponse = z.object({
  recurring_application_charge: z.object({
    confirmation_url: z.string(),
  }),
});

const GetRecurringApplicationChargeResponse = z.object({
  recurring_application_charge: z.object({
    name: z.string(),
    activated_on: z.nullable(z.string()),
    trial_days: z.number(),
    status: z.enum([
      'pending',
      'accepted',
      'active',
      'declined',
      'expired',
      'frozen',
      'cancelled',
    ]),
    price: z.string(),
  }),
});

@singleton()
export class ShopifyService {
  public async getClient() {
    const gotImport = await import('got');
    return gotImport.got;
  }

  public async exchangeCodeForAccessToken({
    shopDomain,
    code,
  }: {
    shopDomain: string;
    code: string;
  }) {
    const cliendId = config.NEXT_PUBLIC_SHOPIFY_CLIENT_ID;
    const clientSecret = config.SHOPIFY_CLIENT_SECRET;
    const client = await this.getClient();
    const json = await client
      .post(
        `https://${shopDomain}/admin/oauth/access_token?client_id=${cliendId}&client_secret=${clientSecret}&code=${code}`,
      )
      .json();

    const parsed = ExchangeCodeForAccessTokenResponse.parse(json);
    return parsed;
  }

  public async getShop({
    shopDomain,
    accessToken,
  }: {
    shopDomain: string;
    accessToken: string;
  }) {
    const client = await this.getClient();
    const json = await client
      .get(
        `https://${shopDomain}/admin/api/${config.SHOPIFY_API_VERSION}/shop.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
          },
        },
      )
      .json();

    const parsed = GetShopResponse.parse(json);
    return parsed;
  }

  public async getWebhooks({
    shopDomain,
    accessToken,
  }: {
    shopDomain: string;
    accessToken: string;
  }) {
    const client = await this.getClient();
    const json = await client
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
    const client = await this.getClient();
    await client.post(
      `https://${shopDomain}/admin/api/${config.SHOPIFY_API_VERSION}/webhooks.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
        json: {
          webhook: {
            topic,
            address: `${config.BASE_URL}/api/shopify/webhooks`,
            format: 'json',
          },
        },
      },
    );
  }

  public async createRecurringApplicationCharge({
    shopDomain,
    accessToken,
    trialDays,
    plan,
  }: {
    shopDomain: string;
    accessToken: string;
    trialDays: number;
    plan: Plan;
  }) {
    const client = await this.getClient();
    const json = await client
      .post(
        `https://${shopDomain}/admin/api/${config.SHOPIFY_API_VERSION}/recurring_application_charges.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
          },
          json: {
            recurring_application_charge: {
              name: `${plan.name} Subscription`,
              price: plan.price.toNumber(),
              trial_days: trialDays,
              return_url: `${config.BASE_URL}/api/shopify/billing/callback?shopDomain=${shopDomain}&planId=${plan.id}`,
              test: config.NEXT_PUBLIC_APP_ENV === 'production' ? null : true,
            },
          },
        },
      )
      .json();

    const parsed = CreateRecurringApplicationChargeResponse.parse(json);
    return parsed;
  }

  public async getRecurringApplicationCharge({
    shopDomain,
    accessToken,
    chargeId,
  }: {
    shopDomain: string;
    accessToken: string;
    chargeId: bigint;
  }) {
    const client = await this.getClient();
    const json = await client
      .get(
        `https://${shopDomain}/admin/api/${config.SHOPIFY_API_VERSION}/recurring_application_charges/${chargeId}.json`,
        {
          headers: {
            'X-Shopify-Access-Token': accessToken,
          },
        },
      )
      .json();

    const parsed = GetRecurringApplicationChargeResponse.parse(json);
    return parsed;
  }

  public async cancelRecurringApplicationCharge({
    shopDomain,
    accessToken,
    chargeId,
  }: {
    shopDomain: string;
    accessToken: string;
    chargeId: bigint;
  }) {
    const client = await this.getClient();
    await client.delete(
      `https://${shopDomain}/admin/api/${config.SHOPIFY_API_VERSION}/recurring_application_charges/${chargeId}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      },
    );
  }
}
