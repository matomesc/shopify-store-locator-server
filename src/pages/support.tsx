import { Card, Link, Page, Text } from '@shopify/polaris';
import { NextPage } from 'next';
import { FaEnvelope, FaXTwitter, FaSlack } from 'react-icons/fa6';

const Support: NextPage = () => {
  return (
    <Page title="Support">
      <Card>
        <Text as="p">
          If you have any questions, require help or have a feature or bug to
          report please don&apos;t hesitate to contact support - we&apos;ll get
          back to you as soon as possible.
        </Text>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            paddingTop: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FaEnvelope style={{ width: '20px', height: '20px' }} />
            <Link url="mailto:support@neutek.io" target="_blank">
              support@neutek.io
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FaXTwitter style={{ width: '20px', height: '20px' }} />
            <Link url="https://x.com/neuteklabs" target="_blank">
              @neuteklabs
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FaSlack style={{ width: '20px', height: '20px' }} />
            <Link
              url="https://join.slack.com/t/neutek-labs/shared_invite/zt-2pmh8f1r4-5zBEmVokdjDf3LUGHI0J2w"
              target="_blank"
            >
              Neutek Labs Slack
            </Link>
          </div>
        </div>
      </Card>
    </Page>
  );
};

export default Support;
