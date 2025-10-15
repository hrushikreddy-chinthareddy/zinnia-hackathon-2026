import { TransactionError } from '@/components/stepped-workflow/common/TransactionError';
import { TransactionInvalid } from '@/components/stepped-workflow/common/TransactionInvalid';
import {
  TRANSACTION_ERROR_QUERY_PARAM,
  TransactionErrorType,
} from '@/components/stepped-workflow/types';
import { PolicyRequestInputs } from '@/types/policy';

const ErrorPage = ({
  params,
  searchParams,
}: {
  params: PolicyRequestInputs;
  searchParams: {
    [TRANSACTION_ERROR_QUERY_PARAM]?: TransactionErrorType;
    correlationId?: string;
  };
}) => {
  const goToUrl = `/coverage/policies/${params.planCode}/${params.policyNumber}/`;

  if (
    searchParams?.[TRANSACTION_ERROR_QUERY_PARAM] ===
    TransactionErrorType.SUBMISSION_FAILED
  ) {
    return (
      <TransactionInvalid
        goToUrl={goToUrl}
        correlationId={searchParams?.correlationId}
      />
    );
  }

  return (
    <TransactionError
      transactionType="one-time-premium"
      goToUrl={goToUrl}
      correlationId={searchParams?.correlationId}
    />
  );
};

export default ErrorPage;
