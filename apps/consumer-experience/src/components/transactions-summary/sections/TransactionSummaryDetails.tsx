import { FC } from 'react';

import { WithdrawalTransaction } from '@/services/transactions/types';

import { WithdrawalSummaryDetails } from './transaction-types/WithdrawalSummaryDetails';

interface TransactionSummaryDetailsProps {
  transactionSummary: WithdrawalTransaction;
}

export const TransactionSummaryDetails: FC<TransactionSummaryDetailsProps> = ({
  transactionSummary,
}) => {
  switch (transactionSummary.transactionType) {
    case 'WITHDRAWAL': //TODO: Replace with the api type
      return (
        <WithdrawalSummaryDetails transactionSummary={transactionSummary} />
      );
  }

  return null;
};
