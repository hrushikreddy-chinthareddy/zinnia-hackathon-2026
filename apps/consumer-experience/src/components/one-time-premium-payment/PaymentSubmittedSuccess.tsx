import { Link } from '@zinnia/bloom/components';

import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';

import premiumStyles from './OneTimePremiumPayment.module.css';

export const PaymentSubmittedSuccess = ({
  policyNumber,
  planCode,
}: Partial<PolicyRequestInputs>) => {
  return (
    <div className="typography-content-body">
      <p>
        A{' '}
        <span className="typography-content-body-bold">
          {formatUSDollars(10000)}
        </span>{' '}
        one-time premium payment from{' '}
        <span className="typography-content-body-bold">Michael Williams</span>{' '}
        was submitted.{' '}
      </p>
      <p className="mt-xl">
        There will be a confirmation sent to your email shortly.
      </p>
      <div className={premiumStyles.buttonGroup}>
        <Link
          href={`/policies/${planCode}/${policyNumber}`}
          text="Back to policy overview"
          variant="button"
        />
        {/* TODO: show 'are you sure path', this should actually be a link */}
        <Link
          href={`/policies/${planCode}/${policyNumber}/premium/history`}
          text="Go to payment history"
        />
      </div>
    </div>
  );
};
