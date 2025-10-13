import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import { WithdrawalsProvider } from '@/components/stepped-workflow/workflows/withdrawals/provider/WithdrawalsProvider';
import { getOneTimeWithdrawalEligibility } from '@/services/bpm/partial-withdrawal';
import { getFeatureFlagsWithCarrierConfig } from '@/services/feature-flags-carrier-config';
import { PolicyRequestInputs } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

export default async function WithdrawalLayout({
  children,
  params,
}: {
  params: PolicyRequestInputs;
  children: ReactNode;
}) {
  const loggingCtx = await buildCommonLogContext();
  const { featureFlags: flags, carrierConfig } =
    await getFeatureFlagsWithCarrierConfig();
  const showPartialWithdrawalOneTime =
    flags?.[FEATURE_FLAGS.TRANSACTION_PARTIAL_WITHDRAWAL_ONETIME] &&
    carrierConfig?.account?.partialOneTimeWithdrawal?.enabled;
  const { data, error } = await getOneTimeWithdrawalEligibility(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    loggingCtx
  );

  //TODO: Do we need an error component or redirect?
  if (!data?.isEligible || !!error || !showPartialWithdrawalOneTime) {
    redirect(`/coverage/policies/${params.planCode}/${params.policyNumber}/`);
  }

  return (
    <WithdrawalsProvider>
      <div>{children}</div>
    </WithdrawalsProvider>
  );
}
