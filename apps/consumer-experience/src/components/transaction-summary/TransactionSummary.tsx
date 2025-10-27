import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';
import { Button } from '@zinnia/bloom/components';
import { FC } from 'react';

import { getTransactionSummaryById } from '@/services/transactions';
import { formatUSDollars } from '@/utils/currency';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

import { TransactionSummarySubmissionDetails } from './sections/TransactionSummarySubmissionDetails';
import styles from './TransactionSummary.module.css';
import { NoDataAvailable } from '../no-data-available/NoDataAvailable';
import { TransactionPaymentDetails } from './sections/TransactionPaymentDetails';
import { TransactionSummaryDetails } from './sections/TransactionSummaryDetails';
import { ConfirmDialog } from '../confirm-dialog/ConfirmDialog';
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

  //TODO: How to handle this when its not a withdrawal?
  const totalTransactionAmount =
    data?.entity.withdrawalTransaction.withdrawalSummary.totalPayment +
    data?.entity.withdrawalTransaction.withdrawalSummary.withdrawalCharge;

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
        <div className={styles.detailWrapper}>
          <TransactionSummarySubmissionDetails transactionSummary={data} />
        </div>
        <hr className={styles.divider} />
        <div className={styles.detailWrapper}>
          <TransactionSummaryDetails transactionSummary={data} />
        </div>
        <hr className={styles.divider} />
        <TransactionPaymentDetails transactionSummary={data} />
      </div>
      <div className={styles.buttons}>
        <ConfirmDialog
          confirmText="Approve"
          cancelText="Go back"
          message={`Are you sure you want to approve this transaction for ${formatUSDollars(totalTransactionAmount)}?`}
          title="Approve transaction"
          linkText="Approve"
          buttonMode="primary"
        />
        <Button mode="error">Deny</Button>
      </div>
    </div>
  );
};
