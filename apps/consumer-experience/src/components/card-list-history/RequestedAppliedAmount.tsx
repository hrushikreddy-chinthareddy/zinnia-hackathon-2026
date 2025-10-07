/**
 * This component is used to display the submitted amount for a premium and the
 * amount that actually gets added to the account minus fees and charges
 */
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
      {formatUSDollars(requestedAmount)}
      {!!appliedAmount && (
        <p className={`typography-content-body-sm ${styles.requested}`}>
          Added to account value: {formatUSDollars(appliedAmount)}
        </p>
      )}
    </div>
  );
};
