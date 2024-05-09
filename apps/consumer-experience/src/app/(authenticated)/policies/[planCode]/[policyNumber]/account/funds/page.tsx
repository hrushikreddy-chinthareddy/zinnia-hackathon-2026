import { Label } from '@zinnia/bloom/internal/components';
import clsx from 'clsx';
import { Metadata } from 'next';

import { AccountValue } from '@/components/account-value/AccountValue';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { RouteKey, getPageTitle } from '@/route-map';
import { getPolicyFundDetails } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';

import styles from './Funds.module.css';

const pageTitle = getPageTitle(RouteKey.FUNDS);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function AccountValuePage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const { data, error } = await getPolicyFundDetails({
    planCode,
    policyNumber,
  });

  const allocationData = () => {
    if (error || !data) {
      return <NoDataAvailable />;
    }

    return data.map(allocation => {
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
}
