import { SystematicProgram } from '@xd/api-types/dist/generated-types/sor';

import { ApiResponse } from '@/services';
import { policyApiBaseUrl } from '@/services/api-config';
import { ServerApi } from '@/services/server-http';
import { PolicyRequestInputs } from '@/types/policy';
import { parseAPIResponse } from '@/utils/api';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

const FILE_NAME = '/src/services/policy/systematic-programs/index.ts';

export type SystematicProgramResponse = ApiResponse<SystematicProgram[]>;

export const getAllSystematicPrograms = withLogging(
  async (
    options: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<SystematicProgramResponse> => {
    const { planCode, policyNumber } = options;
    const url = `${policyApiBaseUrl}/${planCode}/${policyNumber}/systematicPrograms`;
    const rawResponse = await ServerApi.get(url, undefined, loggingCtx);
    const response: SystematicProgramResponse =
      await parseAPIResponse(rawResponse);

    if (!rawResponse?.ok || !response.data) {
      throw new Error('Error fetching policy', {
        cause: { policyNumber, planCode },
      });
    }

    return response;
  },
  {
    file: FILE_NAME,
    functionName: 'getSystematicPrograms',
  }
);
