import { Intro } from '@/components/stepped-workflow/workflows/free-look-cancel/forms/Intro';
import { getCarrierConfig } from '@/services/carrier-config';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

export default async function FreeLookCancelInformation() {
  const loggingContext = await buildCommonLogContext();
  const { data: carrierConfig } = await getCarrierConfig(loggingContext);

  return <Intro paymentProvider={carrierConfig?.payment?.provider} />;
}
