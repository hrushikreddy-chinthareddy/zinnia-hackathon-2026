import { FC } from 'react';

import { WithdrawalTransaction } from '@/services/transactions/types';

import { KeyValueLabelGroup } from '../components/KeyValueLabel';

interface TransactionSummarySubmissionDetailsProps {
  transactionSummary: WithdrawalTransaction; //TODO: replace this with the real API type
}

export const TransactionSummarySubmissionDetails: FC<
  TransactionSummarySubmissionDetailsProps
> = ({ transactionSummary }) => {
  const authorizationStatus =
    transactionSummary?.entity?.withdrawalTransaction?.authorization
      .authorizationStatus;
  const submittedOn =
    transactionSummary?.entity?.withdrawalTransaction?.withdrawalSummary
      .withdrawalSubmittedDate;
  const expiresOn =
    transactionSummary?.entity?.withdrawalTransaction?.withdrawalSummary
      .withdrawalExpireDate;
  const submittedBy =
    transactionSummary?.entity?.withdrawalTransaction?.agent.name;
  const submittedById =
    transactionSummary?.entity?.withdrawalTransaction?.agent.primaryId;

  const fields = [
    {
      title: 'Authorization',
      children: [
        {
          title: authorizationStatus,
        },
      ],
    },
    {
      title: 'Submitted On',
      children: [
        {
          title: submittedOn, //conver to m/d/yyyy
        },
      ],
    },
    {
      title: 'Expiration Date',
      children: [
        {
          title: expiresOn, //conver to m/d/yyyy
        },
      ],
    },
    {
      title: 'Submitted By',
      children: [
        {
          title: submittedBy,
        },
        {
          title: submittedById,
        },
      ],
    },
  ];

  return <KeyValueLabelGroup fields={fields} />;
};
