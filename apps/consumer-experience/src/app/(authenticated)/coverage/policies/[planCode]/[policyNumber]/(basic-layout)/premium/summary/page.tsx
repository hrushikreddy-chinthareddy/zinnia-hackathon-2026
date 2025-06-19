import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';

import { PaymentSummary } from '@/components/one-time-premium-payment/payment-summary/PaymentSummary';
import { getPolicyAccountValue } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

export default async function Summary({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;
  const loggingContext = await buildCommonLogContext();
  const { data } = await getPolicyAccountValue(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    loggingContext
  );

  return (
    <>
      <PaymentSummary
        policyNumber={policyNumber}
        planCode={planCode}
        lineOfBusiness={LineOfBusiness.LIFE}
        uncollectedCharges={data?.uncollectedCharges || 0}
      />
    </>
  );
}
