import { TransactionError } from '@/components/stepped-workflow/common/TransactionError';
import { PolicyRequestInputsParams } from '@/types/policy';

const ErrorPage = ({ params }: PolicyRequestInputsParams) => {
  const goToUrl = `/coverage/policies/${params.planCode}/${params.policyNumber}/`;
  return (
    <TransactionError transactionType="one-time-premium" goToUrl={goToUrl} />
  );
};

export default ErrorPage;
