import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';
import { FC } from 'react';

import { getTransactionSummaryById } from '@/services/transactions';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

import { TransactionSummarySubmissionDetails } from './sections/TransactionSummarySubmissionDetails';
import styles from './TransactionSummary.module.css';
import { NoDataAvailable } from '../no-data-available/NoDataAvailable';
import { TransactionPaymentDetails } from './sections/TransactionPaymentDetails';
import { TransactionSummaryDetails } from './sections/TransactionSummaryDetails';
import { HeaderPolicyDetails } from '../policy-detail-page-header/header-policy-details/HeaderPolicyDetails';

interface TransactionsSummaryProps {
  transactionId: string;
  planCode: string;
  policyNumber: string;
  lineOfBusiness: LineOfBusiness;
}

export const TransactionsSummary: FC<TransactionsSummaryProps> = async ({
  transactionId,
  planCode,
  policyNumber,
  lineOfBusiness,
}) => {
  const commonLoggingContext = await buildCommonLogContext();

  const { data, error } = await getTransactionSummaryById(
    { transactionId },
    commonLoggingContext
  );

  if (!data || error) {
    return <NoDataAvailable correlationId={error?.correlationId} />;
  }

  return (
    <div className={styles.container}>
      <HeaderPolicyDetails
        planCode={planCode}
        policyNumber={policyNumber}
        lineOfBusiness={lineOfBusiness}
        fieldVisibility={{
          policyName: true,
          policyNumber: true,
          status: false,
          agentInfo: false,
        }}
      />
      <div className={styles.summaryContainer}>
        <TransactionSummarySubmissionDetails transactionSummary={data} />
        <hr className={styles.divider} />
        <TransactionSummaryDetails transactionSummary={data} />
        <hr className={styles.divider} />
        <TransactionPaymentDetails transactionSummary={data} />
      </div>
    </div>
  );
};
