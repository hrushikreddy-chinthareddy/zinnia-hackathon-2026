import {
  TRANSACTION_ERROR_QUERY_PARAM,
  TransactionErrorType,
} from '@/components/stepped-workflow/types';

import { ApiResponseError } from '../types';

export const generateTransactionErrorUrl = (err: ApiResponseError) => {
  const isTransactionError = 'status' in err && err.status === 400;

  // Initialize the base error URL
  let errorUrl = `error?correlationId=${err.correlationId}`;

  // Append the transaction error query param if it is a transaction error
  if (isTransactionError) {
    errorUrl += `&${TRANSACTION_ERROR_QUERY_PARAM}=${TransactionErrorType.SUBMISSION_FAILED}`;
  }

  return errorUrl;
};
