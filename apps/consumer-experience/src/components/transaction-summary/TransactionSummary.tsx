'use client';

import { useMutation } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { FC, PropsWithChildren } from 'react';

import { WithdrawalTransaction } from '@/services/transactions/types';

import { TransactionPaymentDetails } from './sections/TransactionPaymentDetails';
import { TransactionSummaryDetails } from './sections/TransactionSummaryDetails';
import { TransactionSummarySubmissionDetails } from './sections/TransactionSummarySubmissionDetails';
import styles from './TransactionSummary.module.css';
import { ConfirmDialog } from '../confirm-dialog/ConfirmDialog';
import { PaymentLoading } from '../stepped-workflow/common/TransactionLoading';

interface TransactionsSummaryProps {
  transactionDetails: WithdrawalTransaction;
}

export const TransactionsSummary: FC<
  PropsWithChildren<TransactionsSummaryProps>
> = ({ transactionDetails, children }) => {
  const router = useRouter();
  const pathname = usePathname();
  //TODO: When API is done, fix this up
  const fakePost = async (
    url: string,
    data: unknown,
    failureRate: number = 0.2
  ): Promise<{ success: boolean }> => {
    // Log the request for debugging
    console.log(`Making fake POST request to ${url}`, data);

    // Return a promise that resolves after 500ms
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < failureRate) {
          // Simulate different types of errors

          reject({
            success: false,
            status: 500,
            message: 'Error',
            correlationId: '13454',
            timestamp: new Date().toISOString(),
          });
        }

        resolve({
          success: true,
        });
      }, 2000);
    });
  };

  //TODO: When API is done, fix this up
  const handleApprove = () => {
    return fakePost(
      'https://example.com/api/approve-transaction',
      transactionDetails
    );
  };

  //TODO: When API is done, fix this up
  const handleDeny = () => {
    return fakePost(
      'https://example.com/api/approve-transaction',
      transactionDetails
    );
  };

  //TODO: When API is done, fix this up
  const {
    mutate: approveTransaction,
    isPending: isApprovePending,
    isSuccess: isApproveSuccess,
  } = useMutation({
    mutationKey: ['transactionSummary', transactionDetails.entity.recordId],
    mutationFn: handleApprove,
    onSuccess: () => {
      router.push(`${pathname}/confirmation?action=approve`);
    },

    onError: err => {
      router.push(`${pathname}/error?correlationId=${err.correlationId}`);
    },
  });

  //TODO: When API is done, fix this up
  const {
    mutate: denyTransaction,
    isPending: isDenyPending,
    isSuccess: isDenySuccess,
  } = useMutation({
    mutationKey: ['transactionSummary', transactionDetails.entity.recordId],
    mutationFn: handleDeny,
    onSuccess: () => {
      router.push(`${pathname}/confirmation?action=deny`);
    },

    onError: err => {
      router.push(`${pathname}/error?correlationId=${err.correlationId}`);
    },
  });

  if (isDenyPending || isApprovePending || isApproveSuccess || isDenySuccess) {
    return <PaymentLoading />;
  }

  return (
    <div className={styles.container}>
      {children}
      <div className={styles.summaryContainer}>
        <div className={styles.detailWrapper}>
          <TransactionSummarySubmissionDetails
            transactionSummary={transactionDetails}
          />
        </div>
        <hr className={styles.divider} />
        <div className={styles.detailWrapper}>
          <TransactionSummaryDetails transactionSummary={transactionDetails} />
        </div>
        <hr className={styles.divider} />
        <TransactionPaymentDetails transactionSummary={transactionDetails} />
      </div>
      <div className={styles.buttons}>
        <ConfirmDialog
          confirmText="Approve"
          cancelText="Go back"
          message={`Are you sure you want to approve this transaction?`}
          title="Approve transaction"
          linkText="Approve"
          buttonMode="primary"
          confirmCallback={approveTransaction}
        />
        <ConfirmDialog
          confirmText="Deny"
          cancelText="Go back"
          message={`Are you sure you want to deny this transaction?`}
          title="Deny transaction"
          linkText="Deny"
          buttonMode="error"
          confirmCallback={denyTransaction}
        />
      </div>
    </div>
  );
};
