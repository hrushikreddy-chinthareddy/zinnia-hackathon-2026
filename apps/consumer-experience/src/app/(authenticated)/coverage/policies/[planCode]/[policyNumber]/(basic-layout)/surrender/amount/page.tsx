import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { Date } from '@/components/stepped-workflow/workflows/surrender/forms/Date';
import Surrender from '@/components/stepped-workflow/workflows/surrender/Surrender';
import { getPolicySurrenderDetails } from '@/services';
import { PolicyRequestInputsParams } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

export default async function ConfirmPage({
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

  // TODO: is this the right error handling? it's blocking surrenderValue === 0
  if (!!error || !data?.surrenderValue) {
    return <NoDataAvailable message={DEFAULT_UNAVAILABLE_STRING} />;
  }

  return (
    <Surrender currentStepOverride={1}>
      <Date netSurrenderValue={data?.surrenderValue} />
    </Surrender>
  );
}
