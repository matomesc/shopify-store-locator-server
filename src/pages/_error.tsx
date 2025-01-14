import * as Sentry from '@sentry/nextjs';
import { NextPageContext } from 'next';
import Error, { ErrorProps } from 'next/error';

const CustomErrorComponent = (props: ErrorProps) => {
  const { statusCode } = props;
  return <Error statusCode={statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData: NextPageContext) => {
  // In case this is running in a serverless function, await this in order to give Sentry
  // time to send the error before the lambda exits
  await Sentry.captureUnderscoreErrorException(contextData);

  // This will contain the status code of the response
  return Error.getInitialProps(contextData);
};

export default CustomErrorComponent;
