import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import mock from './mock.json';

export const getTransactionSummaryById = withLogging(
  async (
    {
      _transactionId,
    }: {
      _transactionId: string;
    },
    _loggingCtx: CommonLogContext
  ) => {
    return mock;

    // const url = `${apiServerBaseUrl}/transactions/v1/transaction/entities/${transactionId}`;

    // const rawResponse = await ServerApi.get(url, undefined, loggingCtx);
    // const response = await parseAPIResponse(rawResponse);

    // if (!rawResponse?.ok) {
    //   throw new Error('Error fetching transaction summary.', {
    //     cause: { transactionId },
    //   });
    // }

    // if (!response) {
    //   logInfo('Call was successful, but no transaction summary found.', {
    //     ...loggingCtx,
    //     transactionId,
    //   });
    // }

    // return response;
  },
  {
    file: 'src/services/transactions',
    functionName: 'getTransactionSummaryById',
  }
);
