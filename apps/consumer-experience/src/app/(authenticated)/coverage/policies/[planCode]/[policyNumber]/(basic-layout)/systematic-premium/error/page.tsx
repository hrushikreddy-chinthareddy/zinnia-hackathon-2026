import { TransactionError } from '@/components/stepped-workflow/common/TransactionError';
import { TransactionInvalid } from '@/components/stepped-workflow/common/TransactionInvalid';
import { TransactionErrorType } from '@/components/stepped-workflow/types';
import { PolicyRequestInputs } from '@/types/policy';

const ErrorPage = ({
  params,
  searchParams,
}: {
  params: PolicyRequestInputs;
  searchParams: { errorType?: TransactionErrorType };
}) => {
  const goToUrl = `/coverage/policies/${params.planCode}/${params.policyNumber}/`;

  if (searchParams?.errorType === TransactionErrorType.SUBMISSION_FAILED) {
    return <TransactionInvalid goToUrl={goToUrl} />;
  }
  return <TransactionError transactionType="surrender" goToUrl={goToUrl} />;
};

export default ErrorPage;
