import { BannerAlert, BannerVariant } from '@zinnia/bloom/components';
import { toTitleCase } from '@zinnia/utils';

import { HoldingFunds } from '@/components/funds-table/HoldingFunds';
import { NonHoldingFunds } from '@/components/funds-table/NonHoldingFunds';

import styles from './Funds.module.css';

export const IULFundsView = ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
}) => {
  return (
    <>
      <div className={styles.sectionContainer}>
        <h2>{toTitleCase('holding funds')}</h2>
        <p className="typography-content-body-sm">
          Holding funds are where your premium dollars are first deposited.
          While there, all fees and charges (like your cost of of insurance)
          come out. Then, what remains is moved or “swept” into your elected
          funds on the sweep date.
        </p>
        <HoldingFunds planCode={planCode} policyNumber={policyNumber} />
      </div>

      <div className={styles.sectionContainer}>
        <h2>{toTitleCase('available funds')}</h2>
        <BannerAlert
          variant={BannerVariant.Information}
          bodyText="Editing allocations is coming soon. For now, call 1-855-290-0529 to make changes."
        />
        <div>
          <p className="typography-content-body-sm">
            The following funds are available for your policy.{' '}
          </p>
          <p
            className={`typography-content-body-sm ${styles.currentlyElectedLabel}`}
          >
            Currently elected funds
          </p>
        </div>
        <NonHoldingFunds policyNumber={policyNumber} planCode={planCode} />
      </div>
    </>
  );
};
