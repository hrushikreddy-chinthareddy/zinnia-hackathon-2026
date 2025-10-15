import { TransactionError } from '@/components/stepped-workflow/common/TransactionError';
import { PolicyRequestInputsParams } from '@/types/policy';

const ErrorPage = (
  { params }: PolicyRequestInputsParams,
  searchParams: { correlationId?: string }
) => {
  const goToUrl = `/coverage/policies/${params.planCode}/${params.policyNumber}/`;
  return (
    <TransactionError
      transactionType="withdrawal"
      goToUrl={goToUrl}
      correlationId={searchParams?.correlationId}
    />
  );
};

export default ErrorPage;
