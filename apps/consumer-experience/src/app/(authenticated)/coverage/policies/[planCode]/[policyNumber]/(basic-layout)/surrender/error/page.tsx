import { TransactionError } from '@/components/stepped-workflow/common/TransactionError';
import { TransactionType } from '@/components/stepped-workflow/types';
import { PolicyRequestInputsParams } from '@/types/policy';

const ErrorPage = (
  { params }: PolicyRequestInputsParams,
  searchParams: { correlationId?: string }
) => {
  const goToUrl = `/coverage/policies/${params.planCode}/${params.policyNumber}/`;
  return (
    <TransactionError
      transactionType={TransactionType.SURRENDER}
      goToUrl={goToUrl}
      correlationId={searchParams?.correlationId}
    />
  );
};

export default ErrorPage;
