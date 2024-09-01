import { Layout, Link, List, Page, Text } from '@shopify/polaris';
import { NextPage } from 'next';

const Privacy: NextPage = () => {
  return (
    <Page title="Privacy policy">
      <Layout>
        <Layout.Section>
          <Text as="h2" variant="headingMd">
            Effective Date: September 1, 2024
          </Text>
        </Layout.Section>
        <Layout.Section>
          <Text as="h2" variant="headingMd">
            1. Introduction
          </Text>
          <Text as="p">
            Neutek Store Locator & Map (&quot;the App&quot;) is committed to
            protecting your privacy. This Privacy Policy outlines how we handle
            any data associated with the App, specifically regarding visitor
            analytics.
          </Text>
        </Layout.Section>
        <Layout.Section>
          <Text as="h2" variant="headingMd">
            2. Information Collection
          </Text>
          <Text as="p">
            The App collects limited data from visitors to your Shopify
            storefront for analytics purposes. This data may include:
          </Text>
          <List type="bullet">
            <List.Item>IP address</List.Item>
            <List.Item>Browser type</List.Item>
            <List.Item>Device information</List.Item>
            <List.Item>Pages visited</List.Item>
            <List.Item>Time spent on each page</List.Item>
            <List.Item>Geolocation (if available)</List.Item>
          </List>
          <Text as="p">
            We do not collect any personal information that can directly
            identify individual visitors.
          </Text>
        </Layout.Section>
        <Layout.Section>
          <Text as="h2" variant="headingMd">
            3. Data Usage
          </Text>
          <Text as="p">
            The data collected is used solely for analytics purposes. This helps
            us understand how visitors interact with your storefront, enabling
            us to improve the App and enhance the user experience. We may
            analyze this data to generate reports on visitor activity, but these
            reports do not include any personally identifiable information.
          </Text>
        </Layout.Section>
        <Layout.Section>
          <Text as="h2" variant="headingMd">
            4. Data Sharing
          </Text>
          <Text as="p">
            We do not sell, rent, or share any collected data with third
            parties, except as required by law or to protect our rights. The
            data is only used internally to improve the App and provide insights
            to merchants.
          </Text>
        </Layout.Section>
        <Layout.Section>
          <Text as="h2" variant="headingMd">
            5. Data Security
          </Text>
          <Text as="p">
            We take data security seriously. All data collected for analytics
            purposes is securely stored and protected according to industry best
            practices. Access to this data is restricted to authorized personnel
            only.
          </Text>
        </Layout.Section>
        <Layout.Section>
          <Text as="h2" variant="headingMd">
            6. Changes to this Privacy Policy
          </Text>
          <Text as="p">
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page, and the effective date will be updated
            accordingly.
          </Text>
        </Layout.Section>
        <Layout.Section>
          <Text as="h2" variant="headingMd">
            7. Contact Us
          </Text>
          <Text as="p">
            If you have any questions or concerns about this Privacy Policy,
            please contact us at{' '}
            <Link url="mailto:support@neutek.io" target="_blank">
              support@neutek.io
            </Link>
            .
          </Text>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Privacy;
