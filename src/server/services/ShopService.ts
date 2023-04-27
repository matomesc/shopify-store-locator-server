import got from 'got';
import { singleton } from 'tsyringe';
import { config } from '../config';

@singleton()
export class ShopService {
  public async createAppUninstalledWebhook(
    shopDomain: string,
    accessToken: string,
  ) {
    await got.post(
      `https://${shopDomain}/admin/api/${config.SHOPIFY_API_VERSION}/webhooks.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
        json: {
          webhook: {
            topic: 'app/uninstalled',
            address: `${config.BASE_URL}/api/webhooks`,
            format: 'json',
          },
        },
      },
    );
  }
}
