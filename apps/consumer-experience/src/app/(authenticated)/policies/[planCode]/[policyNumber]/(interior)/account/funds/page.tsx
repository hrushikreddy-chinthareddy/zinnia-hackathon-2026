import { Label } from '@zinnia/bloom/internal/components';
import clsx from 'clsx';

import { AccountValue } from '@/components/account-value/AccountValue';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { getPolicyFundDetails } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';

import styles from './Funds.module.css';

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
      <HeaderBreadcrumb title="Funds" />
      <div className={`${styles.container} card`}>
        <AccountValue
          planCode={planCode}
          policyNumber={policyNumber}
          className={clsx({ 'pb-2xl': data?.length })}
        />
        {allocationData()}
      </div>
      <CallForAssistance
        callToAction="Questions about your fund?"
        customInstruction="for more information."
      />
      <Footer />
    </div>
  );
}
