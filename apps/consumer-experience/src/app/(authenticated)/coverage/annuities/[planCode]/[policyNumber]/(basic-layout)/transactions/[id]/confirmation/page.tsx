import clsx from 'clsx';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { TransactionPaymentDetails } from '@/components/transaction-summary/sections/TransactionPaymentDetails';
import styles from '@/components/transaction-summary/TransactionSummary.module.css';
import { RouteKey, getPageTitle } from '@/route-map';
import { getFeatureFlags } from '@/services/feature-flags';
import { getTransactionSummaryById } from '@/services/transactions';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

const pageTitle = getPageTitle(RouteKey.TRANSACTION_SUMMARY);

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function TransactionSummaryConfirmation({
  params,
  searchParams,
}: {
  params: {
    planCode: string;
    policyNumber: string;
    id: string;
  };
  searchParams: { action: 'deny' | 'approve' };
}) {
  const { planCode, policyNumber, id } = params;
  console.log({ searchParams });

  const flags = await getFeatureFlags();
  const commonLoggingContext = await buildCommonLogContext();

  const transactionSummaryEnabled =
    flags?.[FEATURE_FLAGS.AMP_TRANSACTION_SUMMARY];

  const { data: transactionDetails, error } = await getTransactionSummaryById(
    { transactionId: id },
    commonLoggingContext
  );

  if (!transactionSummaryEnabled) return notFound();

  if (!id || error) {
    return <NoDataAvailable correlationId={error?.correlationId} />;
  }

  const denyOrApprove =
    searchParams.action === 'approve' ? 'approval' : 'denial';
  const withdrawalAmount =
    transactionDetails.entity.withdrawalTransaction.withdrawalSummary
      .requestedAmount;
  const policyOwner =
    transactionDetails.entity.withdrawalTransaction.policyHolder.name;
  const agentName = transactionDetails.entity.withdrawalTransaction.agent.name;
  //TODO: How do we get agent corporation???
  const agentCorp =
    transactionDetails.entity.withdrawalTransaction.agent.primaryId;

  return (
    <div>
      <h1 className="mb-xl">Thank you for the confirmation!</h1>
      <p className="typography-content-body mb-md">
        We received your {denyOrApprove} for the {withdrawalAmount} withdrawal
        request for {policyOwner} submitted by {agentName} from ????? TODO:
        Where does the agent corporation come from???.
      </p>

      <p className="typography-content-body mb-md">
        There will be a confirmation sent to your email shortly. Processing
        times depend on your withdrawal type and method.
      </p>

      <p className="typography-content-body mb-2xl">
        Your fee breakdown is below as a reminder.
      </p>
      <hr className={clsx(styles.divider, 'mb-2xl')} />
      <TransactionPaymentDetails transactionSummary={transactionDetails} />
    </div>
  );
}
