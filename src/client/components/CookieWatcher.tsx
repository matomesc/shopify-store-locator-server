import { Modal } from '@shopify/polaris';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

let shop: string;
let host: string;

export const CookieWatcher: React.FC = () => {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    shop = getCookie('shopifyShop') as string;
    host = getCookie('shopifyHost') as string;
    const interval = setInterval(() => {
      if (
        getCookie('shopifyShop') !== shop ||
        getCookie('shopifyHost') !== host
      ) {
        clearInterval(interval);
        setModalOpen(true);
      }

      return () => {
        clearInterval(interval);
      };
    }, 1000);
  }, []);
  return (
    <Modal
      open={modalOpen}
      onClose={() => {}}
      title="App was opened in a different store"
      primaryAction={{
        content: 'Reload',
        onAction: () => {
          router
            .push(
              `/redirect?redirectUrl=${encodeURIComponent(
                `https://admin.shopify.com/store/${
                  shop.split('.myshopify.com')[0]
                }/apps/${String(process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID)}`,
              )}`,
            )
            .catch((err) => console.log(err));
        },
      }}
    >
      <Modal.Section>
        <p>
          The app was opened in a different store. Reload the app to continue
          using the app in this store.
        </p>
      </Modal.Section>
    </Modal>
  );
};
