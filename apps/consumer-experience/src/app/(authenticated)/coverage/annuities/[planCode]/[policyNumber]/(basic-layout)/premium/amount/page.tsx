import { SelectAmount } from '@/components/one-time-premium-payment/SelectAmount';
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
  const { data } = await getCarrierProductOneTimePaymentFee({
    configuredItemCode: ConfiguredSettingId.ONE_TIME_PREMIUM_PAYMENT_GUAR_FEE,
    carrierId: 'SBUL',
    planCode: planCode,
    benefitId: 'Base_Coverage',
  });

  return (
    <SelectAmount
      policyNumber={policyNumber}
      planCode={planCode}
      paymentFee={data?.fee || 0}
    />
  );
}
