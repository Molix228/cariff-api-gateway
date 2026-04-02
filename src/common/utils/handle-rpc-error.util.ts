import { HttpException, HttpStatus } from '@nestjs/common';

export const handleRpcError = (error: any): never => {
  const status =
    [error?.statusCode, error?.status, error?.response?.statusCode].find(
      Number.isInteger,
    ) || HttpStatus.INTERNAL_SERVER_ERROR;

  const message =
    error?.message || error?.response?.message || 'Internal server error';

  throw new HttpException(message, status);
};
