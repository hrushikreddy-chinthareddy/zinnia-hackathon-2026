import { PolicyStatus } from '@zinnia/api-types/types/sor';

import { SelectAmount } from '@/components/stepped-workflow/workflows/one-time-premium/forms/SelectAmount';
import { OneTimePremium } from '@/components/stepped-workflow/workflows/one-time-premium/OneTimePremium';
import { getPolicyDetails, getPolicyStatusDetails } from '@/services';
import {
  ConfiguredSettingId,
  getCarrierProductOneTimePaymentFee,
} from '@/services/product-rate';
import { PolicyRequestInputs } from '@/types/policy';
import { logTrace } from '@/utils/logging/log-fns';
import {
  buildCommonLogContext,
  LoggingModule,
  LoggingStage,
} from '@/utils/logging/server-logging';

const currentFilePath = new URL(import.meta.url).pathname;

export default async function SelectAmountPage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;

  logTrace(`${LoggingModule.PAGE}::SelectAmountPage::${LoggingStage.START}`, {
    file: currentFilePath,
    function: 'SelectAmountPage',
  });

  const commonLog = await buildCommonLogContext();

  try {
    const { data: policyDetails } = await getPolicyDetails(
      {
        planCode: params.planCode,
        policyNumber: params.policyNumber,
      },
      commonLog
    );

    if (!policyDetails) {
      throw new Error('Failed to fetch contract details');
    }

    const [policyStatusRes, ottpFeeRes] = await Promise.allSettled([
      getPolicyStatusDetails(
        {
          planCode: params.planCode,
          policyNumber: params.policyNumber,
        },
        commonLog
      ),
      getCarrierProductOneTimePaymentFee(
        {
          configuredItemCode:
            ConfiguredSettingId.ONE_TIME_PREMIUM_PAYMENT_GUAR_FEE,
          carrierId: policyDetails.carrierId || '',
          planCode: planCode,
          benefitId: 'Base_Coverage',
        },
        commonLog
      ),
    ]);

    const policyStatusDetails =
      policyStatusRes.status === 'fulfilled'
        ? policyStatusRes.value.data
        : null;
    const fee =
      ottpFeeRes.status === 'fulfilled' ? ottpFeeRes.value.data : null;

    return (
      <OneTimePremium
        currentStepOverride={0}
        planCode={planCode}
        policyNumber={policyNumber}
      >
        <SelectAmount
          paymentFee={fee || 0}
          minimumPaymentDue={
            policyStatusDetails?.policyStatus === PolicyStatus.PENDINGLAPSE &&
            policyStatusDetails?.minimumPaymentDue
              ? policyStatusDetails?.minimumPaymentDue
              : 0
          }
        />
      </OneTimePremium>
    );
  } catch (error) {
    logTrace('SelectAmountPage error', {
      file: currentFilePath,
      function: 'SelectAmountPage',
      error,
    });

    throw error;
  }
}
