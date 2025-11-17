import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import { SelectDistribution } from '@/components/stepped-workflow/workflows/free-look-cancel/forms/SelectDistribution';
import { getPolicyProfileData } from '@/services';
import { getFeatureFlagsWithCarrierConfig } from '@/services/feature-flags-carrier-config';
import { getPaymentMethods } from '@/services/payment-methods';
import { filterItemsWithPastEndDate } from '@/utils/data';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

export default async function FreeLookCancelInformation({
  params,
}: {
  params: {
    planCode: string;
    policyNumber: string;
  };
}) {
  const { planCode, policyNumber } = params;
  const loggingContext = await buildCommonLogContext();
  const { carrierConfig } = await getFeatureFlagsWithCarrierConfig();

  const [initialPaymentMethodsRes, policyDataRes] = await Promise.allSettled([
    getPaymentMethods(
      {
        policyNumber,
        planCode,
      },
      loggingContext
    ),
    getPolicyProfileData(
      {
        planCode,
        policyNumber,
      },
      loggingContext
    ),
  ]);

  const initialPaymentMethods =
    initialPaymentMethodsRes.status === 'fulfilled'
      ? initialPaymentMethodsRes.value.data
      : null;

  const policyData =
    policyDataRes.status === 'fulfilled' ? policyDataRes.value.data : null;

  const addresses = filterItemsWithPastEndDate(policyData?.addresses);

  return (
    <SelectDistribution
      {...params}
      lineOfBusiness={LineOfBusiness.ANNUITY}
      initialPaymentMethods={initialPaymentMethods || []}
      activeAddresses={addresses}
      paymentProvider={carrierConfig?.payment?.provider}
      correlationId={loggingContext.correlationId}
    />
  );
}
