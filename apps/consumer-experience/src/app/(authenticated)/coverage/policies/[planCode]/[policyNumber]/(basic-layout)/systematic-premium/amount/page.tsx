import { SystematicProgram } from '@xd/api-types/dist/generated-types/sor';

import { SystematicPremiumAmountStep } from '@/components/workflows/systematic-premiums/forms/SystematicPremiumAmountStep';
import { SystematicPremiums } from '@/components/workflows/systematic-premiums/SystematicPremiums';
import { getAllSystematicPrograms } from '@/services/policy/systematic-programs';
import { PolicyRequestInputsParams } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

const AmountPage = async ({ params }: PolicyRequestInputsParams) => {
  const loggingCtx = await buildCommonLogContext();
  let systematicPrograms = [] as SystematicProgram[];

  const { data: systematicProgramResponse } = await getAllSystematicPrograms(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    loggingCtx
  );

  if (systematicProgramResponse?.data) {
    systematicPrograms = systematicProgramResponse.data;
  }

  return (
    <SystematicPremiums
      currentStepOverride={0}
    >
      <SystematicPremiumAmountStep systematicPrograms={systematicPrograms} />
    </SystematicPremiums>
  );
};

export default AmountPage;
