'use client';
import { useWithdrawals } from '../provider/useWithdrawals';

export const SubmissionPage = () => {
  const { state } = useWithdrawals();
  const submittedAmount = state.withdrawalAmountStep.paymentAmount;
  const payee = state.payeeStep.payeeName;
  return (
    <>
      <p className="typography-content-body">
        A{' '}
        <span className="typography-content-body-bold">${submittedAmount}</span>{' '}
        withdrawal to{' '}
        <span className="typography-content-body-bold">{payee}</span> was
        submitted
      </p>
      <p className="typography-content-body-sm">
        There will be aconfirmation sent to your email shortly. Processing times
        depend on your withdrawal type and method.
      </p>
    </>
  );
};
