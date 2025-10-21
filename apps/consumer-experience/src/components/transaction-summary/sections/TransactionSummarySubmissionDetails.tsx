import { Tag } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { FC } from 'react';

import { WithdrawalTransaction } from '@/services/transactions/types';
import { DEFAULT_DATE_FORMAT } from '@/utils/dates';

import { KeyValueLabelGroup } from '../components/KeyValueLabel';
import { getAuthorizationTagStatus } from '../utils';

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
          customComponent: (
            <Tag
              variant={getAuthorizationTagStatus(authorizationStatus)}
              text={authorizationStatus}
            />
          ),
        },
      ],
    },
    {
      title: 'Submitted On',
      children: [
        {
          title: dayjs(submittedOn).format(DEFAULT_DATE_FORMAT),
        },
      ],
    },
    {
      title: 'Expiration Date',
      children: [
        {
          title: dayjs(expiresOn).format(DEFAULT_DATE_FORMAT),
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
