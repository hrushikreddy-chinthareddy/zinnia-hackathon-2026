import { FC } from 'react';

import { WithdrawalTransaction } from '@/services/transactions/types';

import { WithdrawalDetailsInfo } from './transaction-types/withdrawal/WithdrawalDetailsInfo';

interface TransactionSummaryDetailsProps {
  transactionSummary: WithdrawalTransaction;
}

export const TransactionSummaryDetails: FC<TransactionSummaryDetailsProps> = ({
  transactionSummary,
}) => {
  switch (transactionSummary.transactionType) {
    case 'WITHDRAWAL': //TODO: Replace with the api type
      return <WithdrawalDetailsInfo transactionSummary={transactionSummary} />;
  }

  return null;
};
