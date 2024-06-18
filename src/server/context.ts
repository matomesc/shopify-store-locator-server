import { inferAsyncReturnType } from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import jwt from 'jsonwebtoken';
import { config } from './config';

interface JwtPayload {
  /**
   * The url of the shopify store eg. https://myshop.myshopify.com
   */
  dest: string;
}

export async function createContext({
  req,
}: trpcNext.CreateNextContextOptions) {
  let shop: string | null = null;

  if (req.headers.authorization) {
    try {
      const payload = jwt.verify(
        req.headers.authorization.split(' ')[1],
        config.SHOPIFY_CLIENT_SECRET,
        { clockTolerance: 30 },
      ) as JwtPayload;
      // eslint-disable-next-line prefer-destructuring
      shop = payload.dest.split('://')[1];
    } catch (err) {
      shop = null;
    }
  }

  return {
    shop,
  };
}
export type Context = inferAsyncReturnType<typeof createContext>;
