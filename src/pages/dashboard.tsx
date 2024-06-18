import { GetServerSideProps, NextPage } from 'next';
import { Card, Page } from '@shopify/polaris';
import { prisma } from '@/server/lib/prisma';
import { verifyScopes, verifyShopifyRequest } from '@/server/lib/shopify';
import { config } from '@/server/config';
import { trpc } from '@/lib/trpc';

const Dashboard: NextPage = () => {
  const hello = trpc.hello.useQuery({ text: 'Hello' });

  if (hello.isLoading) {
    return (
      <Page fullWidth>
        <div>Loading...</div>
      </Page>
    );
  }

  if (hello.isError) {
    return (
      <Page fullWidth>
        <div>Error</div>
      </Page>
    );
  }

  return (
    <Page fullWidth>
      <Card>Dashboard {hello.data.greeting}</Card>
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
        return {
          redirect: {
            destination: `/redirect?redirectUrl=${encodeURIComponent(
              redirectUrl,
            )}`,
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
