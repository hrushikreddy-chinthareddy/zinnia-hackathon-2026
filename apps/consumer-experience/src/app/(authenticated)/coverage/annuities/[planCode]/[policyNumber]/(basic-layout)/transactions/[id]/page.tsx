import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { TransactionsSummary } from '@/components/transaction-summary/TransactionSummary';
import { RouteKey, getPageTitle } from '@/route-map';
import { getFeatureFlags } from '@/services/feature-flags';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

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
    transactionId: string;
  };
}) {
  const { planCode, policyNumber, transactionId } = params;
  const flags = await getFeatureFlags();

  const transactionSummaryEnabled =
    flags?.[FEATURE_FLAGS.AMP_TRANSACTION_SUMMARY];

  if (!transactionSummaryEnabled) return notFound();

  return (
    <TransactionsSummary
      transactionId={transactionId}
      planCode={planCode}
      policyNumber={policyNumber}
      lineOfBusiness={LineOfBusiness.ANNUITY}
    />
  );
}
