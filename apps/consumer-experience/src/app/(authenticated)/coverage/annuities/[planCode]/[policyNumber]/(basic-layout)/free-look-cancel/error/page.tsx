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
  searchParams: { errorType?: TransactionErrorType };
}) => {
  const goToUrl = `/coverage/policies/${params.planCode}/${params.policyNumber}/`;

  if (searchParams?.errorType === TransactionErrorType.SUBMISSION_FAILED) {
    return (
      <TransactionInvalid
        goToUrl={goToUrl}
        // TODO: Add correlationId here when API implemented
      />
    );
  }

  return (
    <TransactionError
      transactionType={TransactionType.FREE_LOOK_CANCEL}
      goToUrl={goToUrl}
      // TODO: Add correlationId here when API implemented
    />
  );
};

export default ErrorPage;
