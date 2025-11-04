import { Label } from '@zinnia/bloom/components';
import { FC } from 'react';

import { PaymentSummaryStep } from '@/components/payment-summary-step/PaymentSummaryStep';
import { WithdrawalTransaction } from '@/services/transactions/types';

interface WithdrawalPaymentInfoProps {
  transactionSummary: WithdrawalTransaction;
}

export const WithdrawalPaymentInfo: FC<WithdrawalPaymentInfoProps> = ({
  transactionSummary,
}) => {
  const summaryItems = [
    {
      label: <Label>Amount sent to payee</Label>,
      value:
        transactionSummary.entity?.withdrawalTransaction?.withdrawalSummary
          .totalPayment,
    },
    {
      label: <Label>Withdrawal charge</Label>,
      value:
        transactionSummary.entity?.withdrawalTransaction?.withdrawalSummary
          .withdrawalCharge,
    },
    {
      label: <Label>Federal Tax</Label>,
      value: 0, //TODO: Get a real amount from the api
    },
    {
      label: <Label>State Tax</Label>,
      value: 0, //TODO: Get a real amount from the api
    },
  ];

  const total = {
    deposit:
      transactionSummary.entity?.withdrawalTransaction?.withdrawalSummary
        .totalPayment +
      transactionSummary.entity?.withdrawalTransaction?.withdrawalSummary
        .withdrawalCharge,
    label: <Label>Total Deposit</Label>,
  };

  return <PaymentSummaryStep transactionSummary={summaryItems} total={total} />;
};
