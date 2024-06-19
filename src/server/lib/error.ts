import { CustomError } from 'ts-custom-error';

export class BaseError extends CustomError {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly extra?: Record<string, unknown>,
  ) {
    super(message);
  }
}
