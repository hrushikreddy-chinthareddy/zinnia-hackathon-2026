import { Metadata } from 'next';

import { RouteKey, getPageTitle } from '@/route-map';
import { getPolicyFundDetails } from '@/services';
import { getFeatureFlags } from '@/services/feature-flags';
import { PolicyRequestInputs } from '@/types/policy';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { MultipleFundsView } from './MultipleFundsView';
import { OriginalFundsView } from './OriginalFundsView';

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
  // // TODO: move this into component
  const { data, error } = await getPolicyFundDetails({
    planCode,
    policyNumber,
  });
  const featureFlagDecisions = await getFeatureFlags();
  if (!featureFlagDecisions?.[FEATURE_FLAGS.MULTIPLE_FUNDS_VIEW]) {
    return (
      <OriginalFundsView
        data={data}
        error={error}
        planCode={planCode}
        policyNumber={policyNumber}
      />
    );
  }

  return <MultipleFundsView planCode={planCode} policyNumber={policyNumber} />;
}
