import React from 'react';
import { Card, Page, Tabs } from '@shopify/polaris';
import { useRouter } from 'next/router';

const tabs = [
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/settings', name: 'Settings' },
];

export const NavBar: React.FC = () => {
  const router = useRouter();

  const selected = tabs.findIndex((tab) => {
    if (router.pathname.startsWith(tab.path)) {
      return true;
    }
    return false;
  });

  return (
    <Page fullWidth>
      <Card padding="0">
        <Tabs
          selected={selected}
          onSelect={(selectedTab) => {
            const tab = tabs[selectedTab];
            router.push(tab.path).catch((err) => {
              console.log(err);
            });
          }}
          tabs={tabs.map((tab) => {
            return { id: tab.name, content: tab.name };
          })}
        />
      </Card>
    </Page>
  );
};
