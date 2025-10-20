import { FC } from 'react';

import { WithdrawalTransaction } from '@/services/transactions/types';

import { KeyValueLabelGroup } from '../../../components/KeyValueLabel';

interface WithdrawalSummaryDetailsProps {
  transactionSummary: WithdrawalTransaction;
}

export const WithdrawalDetailsInfo: FC<WithdrawalSummaryDetailsProps> = ({
  transactionSummary,
}) => {
  const withdrawalDate =
    transactionSummary?.entity?.withdrawalTransaction?.withdrawalSummary
      ?.withdrawalSubmittedDate;
  const payee =
    transactionSummary?.entity?.withdrawalTransaction?.policyHolder.name;
  const transactionType = transactionSummary?.transactionType;
  const withdrawalType =
    transactionSummary?.entity?.withdrawalTransaction?.withdrawalSummary
      .withdrawalType;
  const withdrawalMethod =
    transactionSummary?.entity?.withdrawalTransaction?.withdrawalSummary
      .withdrawalMethod;
  const paymentBank =
    transactionSummary?.entity?.withdrawalTransaction?.paymentMethod;

  const fields = [
    {
      title: 'Withdrawal date',
      children: [
        {
          title: withdrawalDate,
        },
      ],
    },
    {
      title: 'Payee',
      children: [
        {
          title: payee,
        },
      ],
    },
    {
      title: 'Transaction type',
      children: [
        {
          title: transactionType,
        },
      ],
    },
    {
      title: 'Withdrawal type',
      children: [
        {
          title: withdrawalType,
        },
      ],
    },
    {
      title: 'Withdrawal method',
      children: [
        {
          title: withdrawalMethod,
        },
      ],
    },
    {
      title: 'Payment bank',
      children: paymentBank
        .map(bank => {
          return bank.bankingDetails.map(bankingDetail => {
            return {
              title: bankingDetail.bankName,
            };
          });
        })
        .flat(),
    },
  ];

  return <KeyValueLabelGroup fields={fields} />;
};
