import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import { SystematicPremiumsProvider } from '@/components/providers/systematic-premiums/SystematicPremiumsProvider';
// import { getSystematicPremiumEligibility } from '@/services/bpm/systematic-premium';
import { getFeatureFlags } from '@/services/feature-flags';
import { PolicyRequestInputs } from '@/types/policy';
// import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

export default async function SystematicPremiumLayout({
  children,
  params,
}: {
  params: PolicyRequestInputs & {
    systematicProgramId?: string
  };
  children: ReactNode;
}) {
  const flags = await getFeatureFlags();
  const showPartialSystematicPremiumOneTime =
    flags?.[FEATURE_FLAGS.TRANSACTION_SYSTEMATIC_PREMIUM];

  // TODO: Add elegibility endpoint in CUI-842
  // const loggingCtx = await buildCommonLogContext()

  // const { data } = await getSystematicPremiumEligibility({
  //   planCode: params.planCode,
  //   policyNumber: params.policyNumber,
  // }, loggingCtx);

  if (/* !data?.data?.isEligible || */ !showPartialSystematicPremiumOneTime) {
    redirect(`/coverage/policies/${params.planCode}/${params.policyNumber}/`);
  }

  return (
    <SystematicPremiumsProvider>
      <div>{children}</div>
    </SystematicPremiumsProvider>
  );
}
