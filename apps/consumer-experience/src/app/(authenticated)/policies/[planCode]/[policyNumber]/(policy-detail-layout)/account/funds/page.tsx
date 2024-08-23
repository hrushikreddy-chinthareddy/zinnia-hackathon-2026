import { ProductType } from '@zinnia/api-types/types/sor';
import { Metadata } from 'next';

import { AccountValue } from '@/components/account-value/AccountValue';
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
  const { data } = await getPolicyDetails({
    planCode,
    policyNumber,
  });

  const featureFlagDecisions = await getFeatureFlags();
  if (!featureFlagDecisions?.[FEATURE_FLAGS.MULTIPLE_FUNDS_VIEW]) {
    return (
      <OriginalFundsView planCode={planCode} policyNumber={policyNumber} />
    );
  }

  return (
    <div className="container">
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
