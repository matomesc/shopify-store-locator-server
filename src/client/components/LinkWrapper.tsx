import { LinkLikeComponentProps } from '@shopify/polaris/build/ts/src/utilities/link';
import React from 'react';
import Link from 'next/link';

export const LinkWrapper: React.FC<LinkLikeComponentProps> = (props) => {
  const { children, url, ref, ...rest } = props;

  return (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <Link href={url} {...rest}>
      {children}
    </Link>
  );
};
