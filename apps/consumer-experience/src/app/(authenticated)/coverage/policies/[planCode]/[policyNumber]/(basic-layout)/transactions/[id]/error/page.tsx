import { TransactionError } from '@/components/stepped-workflow/common/TransactionError';
import { TransactionInvalid } from '@/components/stepped-workflow/common/TransactionInvalid';
import {
  TransactionErrorType,
  TransactionType,
} from '@/components/stepped-workflow/types';
import { PolicyRequestInputs } from '@/types/policy';

const ErrorPage = ({
  params,
  searchParams,
}: {
  params: PolicyRequestInputs;
  searchParams: { errorType?: TransactionErrorType; correlationId?: string };
}) => {
  const goToUrl = `/coverage/policies/${params.planCode}/${params.policyNumber}/`;

  if (searchParams?.errorType === TransactionErrorType.SUBMISSION_FAILED) {
    return (
      <TransactionInvalid
        goToUrl={goToUrl}
        correlationId={searchParams.correlationId}
      />
    );
  }
  return (
    <TransactionError
      transactionType={TransactionType.SURRENDER}
      goToUrl={goToUrl}
      correlationId={searchParams?.correlationId}
    />
  );
};

export default ErrorPage;
