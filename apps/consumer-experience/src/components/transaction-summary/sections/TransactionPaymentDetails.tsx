import { FC } from 'react';

import { WithdrawalTransaction } from '@/services/transactions/types';

import { WithdrawalPaymentInfo } from './transaction-types/withdrawal/WithdrawalPaymentInfo';

interface TransactionPaymentDetailsProps {
  transactionSummary: WithdrawalTransaction;
}

export const TransactionPaymentDetails: FC<TransactionPaymentDetailsProps> = ({
  transactionSummary,
}) => {
  switch (transactionSummary.transactionType) {
    case 'WITHDRAWAL': //TODO: Replace with the api type
      return <WithdrawalPaymentInfo transactionSummary={transactionSummary} />;
  }

  return null;
};
