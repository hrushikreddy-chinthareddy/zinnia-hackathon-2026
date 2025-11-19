import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { HeaderPolicyDetails } from '@/components/policy-detail-page-header/header-policy-details/HeaderPolicyDetails';
import { TransactionsSummary } from '@/components/transaction-summary/TransactionSummary';
import { RouteKey, getPageTitle } from '@/route-map';
import { getFeatureFlags } from '@/services/feature-flags';
import { getTransactionSummaryById } from '@/services/transactions';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

const pageTitle = getPageTitle(RouteKey.TRANSACTION_SUMMARY);

// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function TransactionSummary({
  params,
}: {
  params: {
    planCode: string;
    policyNumber: string;
    id: string;
  };
}) {
  const { planCode, policyNumber, id } = params;

  const flags = await getFeatureFlags();
  const commonLoggingContext = await buildCommonLogContext();

  const transactionSummaryEnabled =
    flags?.[FEATURE_FLAGS.AMP_TRANSACTION_SUMMARY];

  const { data, error } = await getTransactionSummaryById(
    { transactionId: id },
    commonLoggingContext
  );

  if (!transactionSummaryEnabled) return notFound();

  if (!id || error) {
    return <NoDataAvailable correlationId={error?.correlationId} />;
  }

  return (
    <TransactionsSummary transactionDetails={data}>
      <HeaderPolicyDetails
        planCode={planCode}
        policyNumber={policyNumber}
        lineOfBusiness={LineOfBusiness.LIFE}
        fieldVisibility={{
          policyName: true,
          policyNumber: true,
          status: false,
          agentInfo: false,
        }}
      />
    </TransactionsSummary>
  );
}
