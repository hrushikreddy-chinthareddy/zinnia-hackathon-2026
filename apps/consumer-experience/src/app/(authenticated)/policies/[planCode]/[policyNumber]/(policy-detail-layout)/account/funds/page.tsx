import { Metadata } from 'next';

import { RouteKey, getPageTitle } from '@/route-map';
import { getFeatureFlags } from '@/services/feature-flags';
import { PolicyRequestInputs } from '@/types/policy';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { FundsView } from './FundsView';
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

  const featureFlagDecisions = await getFeatureFlags();
  if (!featureFlagDecisions?.[FEATURE_FLAGS.MULTIPLE_FUNDS_VIEW]) {
    return (
      <OriginalFundsView planCode={planCode} policyNumber={policyNumber} />
    );
  }

  return <FundsView planCode={planCode} policyNumber={policyNumber} />;
}
