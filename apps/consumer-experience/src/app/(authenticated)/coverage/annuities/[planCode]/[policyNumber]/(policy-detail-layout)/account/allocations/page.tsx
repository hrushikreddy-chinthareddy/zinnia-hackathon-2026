import { ProductType } from '@zinnia/api-types/types/sor';
import { Metadata } from 'next';

import styles from '@/app/(authenticated)/coverage/shared-styles/Funds.module.css';
import { AccountValue } from '@/components/account-value/AccountValue';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { OutstandingLoanValue } from '@/components/outstanding-loan-value/OutstandingLoanValue';
import accountValueStyles from '@/components/policy-overview/PolicyOverview.module.css';
import { RouteKey, getPageTitle } from '@/route-map';
import { getPolicyDetails, getPolicyStatusDetails } from '@/services';
import { getFeatureFlags } from '@/services/feature-flags';
import { PolicyRequestInputs } from '@/types/policy';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { OriginalFundsView } from './OriginalFundsView';
import { ULFundsView } from './ULFundsView';

const pageTitle = getPageTitle(RouteKey.ALLOCATIONS);
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

  const { data: policyStatusDetails } = await getPolicyStatusDetails({
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
      <div className={`${styles.detailsContainer} card`}>
        <AccountValue
          planCode={planCode}
          policyNumber={policyNumber}
          hideTicker
          className={accountValueStyles.allocationsContainer}
        />
        <OutstandingLoanValue planCode={planCode} policyNumber={policyNumber} />
      </div>
      {data?.product?.productType === ProductType.FIXEDANNUITY && (
        <ULFundsView
          planCode={planCode}
          policyNumber={policyNumber}
          initialPolicyStatus={policyStatusDetails}
        />
      )}
    </div>
  );
}
