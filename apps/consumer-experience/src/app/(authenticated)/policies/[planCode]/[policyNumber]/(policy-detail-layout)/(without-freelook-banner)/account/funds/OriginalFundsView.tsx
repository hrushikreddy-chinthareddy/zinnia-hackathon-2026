import { Label } from '@zinnia/bloom/components';
import clsx from 'clsx';

import { AccountValue } from '@/components/account-value/AccountValue';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { getPolicyFundDetails } from '@/services';
import { formatUSDollars } from '@/utils/currency';

import styles from './Funds.module.css';

export const OriginalFundsView = async ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
}) => {
  const { data, error } = await getPolicyFundDetails({
    planCode,
    policyNumber,
  });

  const allocationData = () => {
    if (error || !data) {
      return <NoDataAvailable />;
    }

    return data?.map(allocation => {
      return (
        <div className={styles.item} key={allocation.fundName}>
          <div className="stacked-items">
            <Label>{allocation.fundName}</Label>
            <p className="typography-content-body-sm">
              {formatUSDollars(allocation.totalFundValue)}
            </p>
          </div>
          <div className="stacked-items">
            <Label>Allocation</Label>
            <p className="typography-content-body-sm">{`${allocation.allocationPercentage}%`}</p>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="container">
      <div className={`${styles.container} card`}>
        <AccountValue
          planCode={planCode}
          policyNumber={policyNumber}
          className={clsx({ 'pb-2xl': data?.length })}
        />
        {allocationData()}
      </div>
      <CallForAssistance
        callToAction="Questions about your allocation?"
        customInstruction="for more information."
      />
    </div>
  );
};
