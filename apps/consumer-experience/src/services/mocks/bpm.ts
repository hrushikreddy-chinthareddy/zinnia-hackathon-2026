import { TransactionResponse } from '@zinnia/api-types/types/bpm';

export const mockWithdrawalIneligibleResponse = {
  status: 'failure',
  validationResult: [
    {
      errorCode: 'BPM.NM.022',
      attribute: null,
      error:
        'Withdrawals aren’t allowed in the first year from policy issue date.',
      resolution:
        ' Change the date (if you can), or you’ll need to submit for NIGO processing.',
    },
  ],
} as TransactionResponse;
