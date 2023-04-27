import { GetServerSideProps, NextPage } from 'next';
import { prisma } from '@/server/lib/prisma';
import { verifyScopes, verifyShopifyRequest } from '@/server/lib/shopify';
import { config } from '@/server/config';
import { AlphaCard, Page } from '@shopify/polaris';

const Dashboard: NextPage = () => {
  return (
    <Page fullWidth>
      <AlphaCard>Dashboard</AlphaCard>
    </Page>
  );
};

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (ctx.query.shop) {
    const shopDomain = String(ctx.query.shop);
    const shop = await prisma.shop.findFirst({
      where: {
        domain: shopDomain,
      },
    });

    if (
      !shop ||
      shop.uninstalledAt ||
      !verifyScopes(shop.scope, config.SHOPIFY_SCOPE)
    ) {
      const validHmac = verifyShopifyRequest(ctx.query);

      if (!validHmac) {
        throw new Error('Invalid HMAC');
      }

      const redirectUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${
        config.NEXT_PUBLIC_SHOPIFY_CLIENT_ID
      }&scope=${config.SHOPIFY_SCOPE}&redirect_uri=${
        config.SHOPIFY_REDIRECT_URI
      }&state=${Date.now()}`;

      if (ctx.query.embedded === '1') {
        const params = new URLSearchParams();
        Object.keys(ctx.query).forEach((key) => {
          params.set(key, String(ctx.query[key]));
        });
        return {
          redirect: {
            destination: `/redirect?redirectUrl=${encodeURIComponent(
              redirectUrl,
            )}&${params.toString()}`,
            permanent: false,
          },
        };
      }
      return {
        redirect: {
          destination: redirectUrl,
          permanent: false,
        },
      };
    }
  }

  return {
    props: {},
  };
};
