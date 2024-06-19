import { GetServerSideProps, NextPage } from 'next';
import { Button, Card, Page } from '@shopify/polaris';
import { prisma } from '@/server/lib/prisma';
import { verifyScopes, verifyShopifyRequest } from '@/server/lib/shopify';
import { config } from '@/server/config';
import { trpc } from '@/lib/trpc';
import { Spinner } from '@/client/components/Spinner';
import { useEffect, useState } from 'react';
import { PlansModal } from '@/client/components/billing/PlansModal';
import * as Sentry from '@sentry/nextjs';

const Dashboard: NextPage = () => {
  const utils = trpc.useUtils();
  const [state, setState] = useState({
    plansModalOpen: false,
  });
  const shopsGetQuery = trpc.shops.get.useQuery();
  const plansGetAllQuery = trpc.plans.getAll.useQuery();
  const shopsUpdateMutation = trpc.shops.update.useMutation();
  useEffect(() => {
    if (shopsGetQuery.isPending || shopsGetQuery.isError) {
      return;
    }

    setState((prevState) => {
      return {
        ...prevState,
        plansModalOpen: shopsGetQuery.data.shop.showPlansModal,
      };
    });
  }, [
    shopsGetQuery.data?.shop.showPlansModal,
    shopsGetQuery.isError,
    shopsGetQuery.isPending,
  ]);

  if (shopsGetQuery.isPending || plansGetAllQuery.isPending) {
    return <Spinner />;
  }

  if (shopsGetQuery.isError || plansGetAllQuery.isError) {
    return (
      <Page fullWidth>
        <Card>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <p>Failed to load data</p>
            <Button
              onClick={async () => {
                await Promise.all([
                  shopsGetQuery.refetch(),
                  plansGetAllQuery.refetch(),
                ]);
              }}
            >
              Retry
            </Button>
          </div>
        </Card>
      </Page>
    );
  }

  return (
    <Page fullWidth title="Dashboard">
      <Card>Dashboard {shopsGetQuery.data.shop.domain}</Card>
      <PlansModal
        open={state.plansModalOpen}
        currentPlanId={shopsGetQuery.data.shop.planId}
        plans={plansGetAllQuery.data.plans}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClose={async () => {
          setState((prevState) => {
            return {
              ...prevState,
              plansModalOpen: false,
            };
          });

          try {
            await shopsUpdateMutation.mutateAsync({
              showPlansModal: false,
            });
            await utils.shops.get.invalidate();
          } catch (err) {
            Sentry.captureException(err);
          }
        }}
      />
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
      !verifyScopes(shop.accessTokenScope, config.SHOPIFY_SCOPE)
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
