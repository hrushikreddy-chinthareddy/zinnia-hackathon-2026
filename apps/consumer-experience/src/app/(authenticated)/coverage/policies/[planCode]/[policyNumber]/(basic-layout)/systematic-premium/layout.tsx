import {
  FeatureType,
  ProductType,
  Reason,
} from '@xd/api-types/dist/generated-types/sor';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import {
  AutopayStatus,
  determineAutopayDisplayAndEligibility,
} from '@/components/policy-overview/utils';
import { SystematicPremiumsProvider } from '@/components/providers/systematic-premiums/SystematicPremiumsProvider';
// import { getSystematicPremiumEligibility } from '@/services/bpm/systematic-premium';
import { getPolicyDetails } from '@/services';
import { getFeatureFlagsWithCarrierConfig } from '@/services/feature-flags-carrier-config';
import { getPolicyFeatures } from '@/services/policy/features';
import { getAllSystematicPrograms } from '@/services/policy/systematic-programs';
import { PolicyRequestInputs } from '@/types/policy';
// import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

export default async function SystematicPremiumLayout({
  children,
  params,
}: {
  params: PolicyRequestInputs & {
    systematicProgramId?: string;
  };
  children: ReactNode;
}) {
  const { featureFlags: flags, carrierConfig } =
    await getFeatureFlagsWithCarrierConfig();
  const showPartialSystematicPremiumOneTime =
    flags?.[FEATURE_FLAGS.TRANSACTION_SYSTEMATIC_PREMIUM] &&
    carrierConfig?.systematicPremium?.enabled;

  const loggingCtx = await buildCommonLogContext();

  // TODO: Can i force cache this somehow?
  const [systematicProgramsRes, policyFeaturesRes, policyDetailsRes] =
    await Promise.allSettled([
      getAllSystematicPrograms(
        {
          planCode: params.planCode,
          policyNumber: params.policyNumber,
        },
        loggingCtx
      ),
      getPolicyFeatures(
        {
          planCode: params.planCode,
          policyNumber: params.policyNumber,
        },
        loggingCtx
      ),
      getPolicyDetails(
        {
          planCode: params.planCode,
          policyNumber: params.policyNumber,
        },
        loggingCtx
      ),
    ]);

  const systematicPrograms =
    systematicProgramsRes.status === 'fulfilled'
      ? systematicProgramsRes.value.data
      : undefined;
  const policyFeaturesData =
    policyFeaturesRes.status === 'fulfilled'
      ? policyFeaturesRes.value.data?.data
      : undefined;
  const policyDetailsData =
    policyDetailsRes.status === 'fulfilled'
      ? policyDetailsRes.value.data
      : undefined;

  const policyBillingFeature = policyFeaturesData?.find(
    feature => feature.featureType === FeatureType.BILLING
  );

  // TODO: i pulled this logic from the `getUpcomingPremium` function
  // I didn't use that function because it is modifying the systematic premium
  // but eventually update that function and update use everywhere
  const currentSystematicProgram = systematicPrograms?.data?.find(
    sp => sp.reason === Reason.PREMIUM
  );

  const { addManageEligible, autopayCurrentState } =
    await determineAutopayDisplayAndEligibility({
      arrangementId: currentSystematicProgram?.arrangementId,
      loggingContext: loggingCtx,
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    });

  if (!addManageEligible || !showPartialSystematicPremiumOneTime) {
    redirect(`/coverage/policies/${params.planCode}/${params.policyNumber}/`);
  }

  return (
    <SystematicPremiumsProvider
      currentSystematicPremium={
        autopayCurrentState === AutopayStatus.MANAGE
          ? currentSystematicProgram
          : undefined
      }
      currentBillingFeature={policyBillingFeature}
      isTerm={policyDetailsData?.product?.productType === ProductType.TERM}
    >
      <div>{children}</div>
    </SystematicPremiumsProvider>
  );
}
