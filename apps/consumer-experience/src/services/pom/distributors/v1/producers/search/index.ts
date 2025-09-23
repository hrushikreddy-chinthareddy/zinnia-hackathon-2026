import { Swizzle_Host_Defaults_Contracts_PagedResponse_1 } from '@zinnia/api-types/types/pom';

import { EnterpriseTokenApi } from '@/services/enterprise-api-token-http';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import { formatPomAgentData } from './transformers';

const fileName = 'apps/consumer-experience/src/services/agent/index.ts';

export const pomAgentSearch = withLogging(
  async (
    { clientCode, agentId }: { clientCode: string; agentId: string },
    loggingCtx: CommonLogContext
  ) => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/distributors/v1/producers/search?limit=10&offset=0`;

    const rawResponse = await EnterpriseTokenApi.post(
      url,
      JSON.stringify({
        searchType: 'SellingCode',
        searchValue: agentId,
        carrierShortName: clientCode,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response: Swizzle_Host_Defaults_Contracts_PagedResponse_1 =
      await parseAPIResponse(rawResponse);

    if (!rawResponse?.ok) {
      const responseDetails = await logApiNotOkDetails({
        rawResponse,
        parsedResponse: response,
      });

      throw new Error('Error calling mcs search agent', {
        cause: {
          clientCode,
          agentId,
          ...responseDetails,
        },
      });
    }

    const formattedAgentData = formatPomAgentData(response.results?.[0]);

    return formattedAgentData;
  },
  {
    file: fileName,
    functionName: 'pomAgentSearch',
  }
);

// export const getAgentInformation = withLogging(
//   async (
//     {
//       clientCode,
//       agentId,
//     }: {
//       clientCode: string;
//       agentId: string;
//     },
//     loggingCtx: CommonLogContext
//   ): Promise<ModifiedAgentData | null> => {
//     const agentData = await mcsAgentSearch({ clientCode, agentId }, loggingCtx);

//     if (agentData.error || !agentData.data) {
//       throw new Error('No agent data recieved', {
//         cause: { clientCode, agentId },
//       });
//     }

//     const normalizedAgentData = transformMcsAgentData(agentData.data);

//     return { ...normalizedAgentData, agentId };
//   },
//   {
//     file: fileName,
//     functionName: 'getAgentInformation',
//   }
// );
