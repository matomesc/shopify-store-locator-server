import * as trpcNext from '@trpc/server/adapters/next';
import jwt from 'jsonwebtoken';
import { config } from '../config';

interface JwtPayload {
  /**
   * The url of the shopify store eg. https://myshop.myshopify.com
   */
  dest: string;
}

export async function createContext({
  req,
}: trpcNext.CreateNextContextOptions) {
  let shopDomain: string | null = null;

  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];

    if (token.startsWith(config.NLM_TOKEN)) {
      // eslint-disable-next-line prefer-destructuring
      shopDomain = token.split(':')[1];
    } else {
      try {
        const payload = jwt.verify(token, config.SHOPIFY_CLIENT_SECRET, {
          clockTolerance: 30,
        }) as JwtPayload;
        // eslint-disable-next-line prefer-destructuring
        shopDomain = payload.dest.split('://')[1];
      } catch (err) {
        shopDomain = null;
      }
    }
  }

  return {
    shopDomain,
  };
}
export type Context = Awaited<ReturnType<typeof createContext>>;
