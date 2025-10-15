import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';
import { FC } from 'react';

import { getTransactionSummaryById } from '@/services/transactions';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

import styles from './TransactionsSummary.module.css';
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

  return (
    <div className={styles.container}>
      <HeaderPolicyDetails
        planCode={planCode}
        policyNumber={policyNumber}
        lineOfBusiness={lineOfBusiness}
      />
      <div className={styles.summaryContainer}></div>
    </div>
  );
};
