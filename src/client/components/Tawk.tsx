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
  const shopsGetQuery = trpc.shops.get.useQuery();

  useEffect(() => {
    window.Tawk_API = window.Tawk_API || {
      onBeforeLoad: () => {
        console.log('onBeforeLoad');
        window.Tawk_API?.minimize?.();
      },
    };
  }, []);

  if (shopsGetQuery.isPending || shopsGetQuery.isError) {
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
          window.Tawk_API.setAttributes?.({
            name: `${shopsGetQuery.data.shop.name} - ${shopsGetQuery.data.shop.domain} - ${shopsGetQuery.data.shop.ownerName}`,
            email: shopsGetQuery.data.shop.email,
            phone: shopsGetQuery.data.shop.phone || '',
          });
        }, 1000);
      }}
    />
  );
};
