import { Spinner as PolarisSpinner } from '@shopify/polaris';
import React from 'react';

export const Spinner: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
      <PolarisSpinner />
    </div>
  );
};
