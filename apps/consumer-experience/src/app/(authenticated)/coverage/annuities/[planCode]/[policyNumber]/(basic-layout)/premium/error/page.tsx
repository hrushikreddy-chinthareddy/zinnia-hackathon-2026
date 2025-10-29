import { FC } from 'react';

import { TransactionError } from '@/components/stepped-workflow/common/TransactionError';
import { TransactionType } from '@/components/stepped-workflow/types';
import { PolicyRequestInputs } from '@/types/policy';

interface ErrorPageProps {
  params: PolicyRequestInputs;
  searchParams: { correlationId?: string };
}

const ErrorPage: FC<ErrorPageProps> = ({ params, searchParams }) => {
  const { planCode, policyNumber } = params;

  const goToUrl = `/coverage/policies/${planCode}/${policyNumber}/`;
  return (
    <TransactionError
      transactionType={TransactionType.ONE_TIME_PREMIUM}
      goToUrl={goToUrl}
      correlationId={searchParams?.correlationId}
    />
  );
};

export default ErrorPage;
