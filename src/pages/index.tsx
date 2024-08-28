import { Modal } from '@/client/components/Modal';
import { Button, Card } from '@shopify/polaris';
import Head from 'next/head';
import { useState } from 'react';

interface ImageProps {
  name: string;
  src: string;
}

const Image: React.FC<ImageProps> = ({ name, src }) => {
  const [state, setState] = useState({ modalOpen: false });
  return (
    <>
      <div
        style={{
          cursor: 'pointer',
        }}
        onClick={() => {
          setState((prevState) => {
            return {
              ...prevState,
              modalOpen: true,
            };
          });
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '200px',
            height: '200px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={name} src={src} style={{ width: '100%' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>{name}</div>
      </div>

      <Modal
        open={state.modalOpen}
        title={name}
        height="fit-content"
        onClose={() => {
          setState((prevState) => {
            return {
              ...prevState,
              modalOpen: false,
            };
          });
        }}
      >
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={name} src={src} style={{ width: '100%' }} />
        </div>
      </Modal>
    </>
  );
};

interface FeatureProps {
  name: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ name, description }) => {
  return (
    <div style={{ width: '300px' }}>
      <Card>
        <div style={{ fontWeight: 'bold' }}>{name}</div>
        <p>{description}</p>
      </Card>
    </div>
  );
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Neutek Locator</title>
        <meta
          name="description"
          content="Enhance your Shopify store with Neutek Locator, the ultimate app for showcasing your physical locations. Easily create and customize interactive maps to display your store locations, complete with essential details and directions. Whether you have multiple outlets or a single shop, Neutek Locator helps your customers find you quickly and effortlessly, boosting both visibility and foot traffic."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            marginTop: '200px',
          }}
        >
          Neutek Locator
        </div>

        <p
          style={{
            maxWidth: '1000px',
            paddingLeft: '20px',
            paddingRight: '20px',
          }}
        >
          Enhance your Shopify store with Neutek Locator: Store Locator & Map,
          the ultimate app for showcasing your physical locations. Easily create
          and customize interactive maps to display your store locations,
          complete with essential details and directions. Whether you have
          multiple outlets or a single shop, Neutek Locator: Store Locator & Map
          helps your customers find you quickly and effortlessly, boosting both
          visibility and foot traffic.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image name="Dashboard" src="/img/homepage/dashboard.png" />
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image name="Analytics" src="/img/homepage/analytics.png" />
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image name="Locator" src="/img/homepage/locator.png" />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Feature
              name="Spreadsheet bulk import"
              description="Easily import your locations in bulk from a CSV file"
            />
            <Feature
              name="Unlimited search filters"
              description="Allow your customers to filter locations"
            />
            <Feature
              name="Unlimited custom fields"
              description="Add custom data to each location"
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Feature
              name="Unlimited custom actions"
              description="Add custom links or execute custom JavaScript"
            />
            <Feature
              name="Multiple language support"
              description="Easily add translations to your search filters, custom fields or custom actions to support multiple languages"
            />
            <Feature
              name="Customize appearance"
              description="Customize the locator with colors in order to match your store. Customize the map markers with images."
            />
          </div>
        </div>

        <div>
          <Button
            size="large"
            onClick={() => {
              window.open('https://apps.shopify.com/', '_blank');
            }}
          >
            Install from the Shopify App Store
          </Button>
        </div>
      </div>
    </>
  );
}
