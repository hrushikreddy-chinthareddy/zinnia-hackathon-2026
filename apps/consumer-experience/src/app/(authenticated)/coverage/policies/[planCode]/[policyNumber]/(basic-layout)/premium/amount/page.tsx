import { LineOfBusiness, PolicyStatus } from '@zinnia/api-types/types/sor';

import { SelectAmount } from '@/components/one-time-premium-payment/SelectAmount';
import { getPolicyDetails, getPolicyStatusDetails } from '@/services';
import {
  ConfiguredSettingId,
  getCarrierProductOneTimePaymentFee,
} from '@/services/product-rate';
import { PolicyRequestInputs } from '@/types/policy';
import { logTrace } from '@/utils/logging/log-fns';
import {
  buildCommonLogContext,
  LoggingFn,
} from '@/utils/logging/server-logging';
const currentFilePath = new URL(import.meta.url).pathname;

export default async function SelectAmountPage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const commonLog = await buildCommonLogContext();

  logTrace('Page::policies::SelectAmountPage', {
    ...commonLog,
    file: currentFilePath,
    function: LoggingFn.SELECT_AMOUNT_PAGE,
  });

  const { data: policyDetails } = await getPolicyDetails(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    commonLog
  );

  const [policyStatusRes, ottpFeeRes] = await Promise.allSettled([
    getPolicyStatusDetails(
      {
        planCode: params.planCode,
        policyNumber: params.policyNumber,
      },
      commonLog
    ),
    getCarrierProductOneTimePaymentFee({
      configuredItemCode: ConfiguredSettingId.ONE_TIME_PREMIUM_PAYMENT_GUAR_FEE,
      carrierId: policyDetails?.carrierId || '',
      planCode: planCode,
      benefitId: 'Base_Coverage',
    }),
  ]);

  const policyStatusDetails =
    policyStatusRes.status === 'fulfilled' ? policyStatusRes.value.data : null;
  const data = ottpFeeRes.status === 'fulfilled' ? ottpFeeRes.value.data : null;

  return (
    <SelectAmount
      policyNumber={policyNumber}
      planCode={planCode}
      paymentFee={data?.fee || 0}
      lineOfBusiness={LineOfBusiness.LIFE}
      minimumPaymentDue={
        policyStatusDetails?.policyStatus === PolicyStatus.PENDINGLAPSE &&
          policyStatusDetails?.minimumPaymentDue
          ? policyStatusDetails?.minimumPaymentDue
          : 0
      }
    />
  );
}
