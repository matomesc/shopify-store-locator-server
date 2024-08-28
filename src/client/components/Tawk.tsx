import { trpc } from '@/lib/trpc';
import Script from 'next/script';
import { useEffect } from 'react';
import { config } from '../config';

declare global {
  interface Window {
    Tawk_API?: {
      setAttributes?: (attributes: Record<string, string>) => void;
      onLoad?: () => void;
      onBeforeLoad?: () => void;
      minimize?: () => void;
    };
  }
}

export const Tawk: React.FC = () => {
  const shopsGetQuery = trpc.shops.get.useQuery(undefined, { retry: false });

  useEffect(() => {
    window.Tawk_API = window.Tawk_API || {
      onBeforeLoad: () => {
        window.Tawk_API?.minimize?.();
      },
    };
  }, []);

  if (shopsGetQuery.isPending) {
    return null;
  }

  return (
    <Script
      src={`https://embed.tawk.to/${config.NEXT_PUBLIC_TAWK_PROPERTY_ID}/${config.NEXT_PUBLIC_TAWK_WIDGET_ID}`}
      onLoad={() => {
        setTimeout(() => {
          if (!window.Tawk_API) {
            return;
          }

          if (shopsGetQuery.isError) {
            // Failed to load the shop. Most likely the user landed on the home page.
            window.Tawk_API.setAttributes?.({
              name: 'Unknown user',
            });
          } else {
            window.Tawk_API.setAttributes?.({
              name: `${shopsGetQuery.data.shop.name} - ${shopsGetQuery.data.shop.domain} - ${shopsGetQuery.data.shop.ownerName}`,
              email: shopsGetQuery.data.shop.email,
              phone: shopsGetQuery.data.shop.phone || '',
            });
          }
        }, 1000);
      }}
    />
  );
};
