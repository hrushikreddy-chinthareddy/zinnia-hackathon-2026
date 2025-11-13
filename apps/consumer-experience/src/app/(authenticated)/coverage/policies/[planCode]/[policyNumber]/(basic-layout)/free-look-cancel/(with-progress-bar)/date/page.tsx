import { SelectDate } from '@/components/stepped-workflow/workflows/free-look-cancel/forms/SelectDate';
import { getPolicySurrenderDetails } from '@/services';
import { PolicyRequestInputsParams } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

export default async function FreeLookCancelInformation({
  params,
}: PolicyRequestInputsParams) {
  const { planCode, policyNumber } = params;

  const loggingContext = await buildCommonLogContext();
  const { data, error } = await getPolicySurrenderDetails(
    {
      planCode,
      policyNumber,
    },
    loggingContext
  );

  return <SelectDate netSurrenderValue={data?.surrenderValue} />;
}
