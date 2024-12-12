import { formatUSDollars } from '@/utils/currency';

import styles from './RequestedAppliedAmount.module.css';

export const RequestedAppliedAmount = ({
  requestedAmount,
  appliedAmount,
}: {
  requestedAmount?: number;
  appliedAmount?: number;
}) => {
  return (
    <div>
      {appliedAmount && <p>{formatUSDollars(appliedAmount)}</p>}
      {requestedAmount && (
        <p className={`typography-content-body-sm ${styles.requested}`}>
          Requested: {formatUSDollars(requestedAmount)}
        </p>
      )}
    </div>
  );
};
