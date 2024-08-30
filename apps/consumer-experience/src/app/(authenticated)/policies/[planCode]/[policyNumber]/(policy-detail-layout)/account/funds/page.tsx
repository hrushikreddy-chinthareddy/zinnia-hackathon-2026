import { ProductType } from '@zinnia/api-types/types/sor';
import { Metadata } from 'next';

import { AccountValue } from '@/components/account-value/AccountValue';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { TotalFundValue } from '@/components/total-fund-value/TotalFundValue';
import { RouteKey, getPageTitle } from '@/route-map';
import { getPolicyDetails } from '@/services';
import { getFeatureFlags } from '@/services/feature-flags';
import { PolicyRequestInputs } from '@/types/policy';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import styles from './Funds.module.css';
import { IULFundsView } from './IULFundsView';
import { OriginalFundsView } from './OriginalFundsView';
import { ULFundsView } from './ULFundsView';

const pageTitle = getPageTitle(RouteKey.FUNDS);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function FundsPage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const { data, error } = await getPolicyDetails({
    planCode,
    policyNumber,
  });

  const featureFlagDecisions = await getFeatureFlags();
  if (!featureFlagDecisions?.[FEATURE_FLAGS.MULTIPLE_FUNDS_VIEW]) {
    return (
      <OriginalFundsView planCode={planCode} policyNumber={policyNumber} />
    );
  }

  if (!data || error) {
    return <NoDataAvailable />;
  }

  return (
    <div className="container">
      {data?.product?.productType === ProductType.UNIVERSALLIFE && (
        <p className="typography-content-body">
          <span className="typography-content-body-bold">
            Your policy’s value is held within a fund.
          </span>{' '}
          As you pay premiums, we first deduct all fees and charges, then
          leftover premium dollars are deposited into your fund, which earns an
          interest rate.
        </p>
      )}
      {data?.product?.productType === ProductType.INDEXEDUNIVERSALLIFE && (
        <p className="typography-content-body">
          <span className="typography-content-body-bold">
            Your policy’s value is held within investment funds.
          </span>{' '}
          As you pay premiums, we first deduct all fees and charges, then
          leftover premium dollars are deposited into your funds. There may be a
          number of funds available for you to choose from or “elect” for
          allocation.
        </p>
      )}
      <div className={`${styles.detailsContainer} card`}>
        <TotalFundValue planCode={planCode} policyNumber={policyNumber} />
        <AccountValue
          planCode={planCode}
          policyNumber={policyNumber}
          hideTicker
        />
      </div>
      {data?.product?.productType === ProductType.UNIVERSALLIFE && (
        <ULFundsView planCode={planCode} policyNumber={policyNumber} />
      )}

      {data?.product?.productType === ProductType.INDEXEDUNIVERSALLIFE && (
        <IULFundsView planCode={planCode} policyNumber={policyNumber} />
      )}
    </div>
  );
}
