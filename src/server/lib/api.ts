import { NextApiRequest, NextApiResponse } from 'next';
import * as Sentry from '@sentry/nextjs';
import { ZodError } from 'zod';

const errors = {
  InternalServerError: {
    statusCode: 500,
    code: 'InternalServerError',
    message: 'Internal server error',
  },
  BadRequest: {
    statusCode: 400,
    code: 'BadRequest',
    message: 'Bad request',
  },
};

export function sendError(
  res: NextApiResponse,
  error: keyof typeof errors,
  options?: {
    statusCode?: number;
    code?: string;
    message?: string;
    zodError?: ZodError;
  },
) {
  const statusCode = options?.statusCode || errors[error].statusCode;
  const code = options?.code || errors[error].code;
  const message = options?.message || errors[error].message;
  const extra = options?.zodError
    ? options.zodError.issues.reduce(
        (acc, issue) => {
          const path = issue.path.join('.');
          if (acc[path]) {
            acc[path].push(issue.message);
          } else {
            acc[path] = [issue.message];
          }
          return acc;
        },
        {} as Record<string, string[]>,
      )
    : undefined;

  return res.status(statusCode).json({
    ok: false,
    error: {
      statusCode,
      code,
      message,
      extra,
    },
  });
}

export function errorHandler(
  err: unknown,
  req: NextApiRequest,
  res: NextApiResponse,
) {
  Sentry.captureException(err);
  sendError(res, 'InternalServerError');
}
