import { LineOfBusiness, PolicyStatus } from '@zinnia/api-types/types/sor';

import { SelectAmount } from '@/components/one-time-premium-payment/SelectAmount';
import { getPolicyStatusDetails } from '@/services';
import {
  ConfiguredSettingId,
  getCarrierProductOneTimePaymentFee,
} from '@/services/product-rate';
import { PolicyRequestInputs } from '@/types/policy';

export default async function SelectBankPage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const [policyStatusRes, ottpFeeRes] = await Promise.allSettled([
    getPolicyStatusDetails({
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    }),
    getCarrierProductOneTimePaymentFee({
      configuredItemCode: ConfiguredSettingId.ONE_TIME_PREMIUM_PAYMENT_GUAR_FEE,
      carrierId: 'SBUL',
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
      lineOfBusiness={LineOfBusiness.ANNUITY}
      minimumPaymentDue={
        policyStatusDetails?.policyStatus === PolicyStatus.PENDINGLAPSE &&
        policyStatusDetails?.minimumPaymentDue
          ? policyStatusDetails?.minimumPaymentDue
          : 0
      }
    />
  );
}
