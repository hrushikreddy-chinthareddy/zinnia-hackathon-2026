import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { Metadata } from 'next';

import { TransactionsSummary } from '@/components/transaction-summary/TransactionSummary';
import { RouteKey, getPageTitle } from '@/route-map';

const pageTitle = getPageTitle(RouteKey.TRANSACTION_SUMMARY); //TODO: Change this

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

  return (
    <TransactionsSummary
      transactionId={transactionId}
      planCode={planCode}
      policyNumber={policyNumber}
      lineOfBusiness={LineOfBusiness.LIFE}
    />
  );
}
