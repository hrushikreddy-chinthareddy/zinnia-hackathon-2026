import { AgentData, ModifiedAgentData } from '@/types/agent';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import { ServerApi } from '..';
import { transformMcsAgentData } from './transformers';

const fileName = 'apps/consumer-experience/src/services/agent/index.ts';

export const mcsAgentSearch = withLogging(
  async (
    { clientCode, agentId }: { clientCode: string; agentId: string },
    loggingCtx: CommonLogContext
  ): Promise<AgentData> => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${clientCode}/salesentity?idType=external&skip=0&take=1&id=${agentId}&IsClientChild=true`;

    const rawResponse = await ServerApi.get(url, undefined, loggingCtx);

    const response = await parseAPIResponse(rawResponse);
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

    return response.items?.[0];
  },
  {
    functionName: 'mcsAgentSearch',
    file: fileName,
  }
);

export const getAgentInformation = withLogging(
  async (
    {
      clientCode,
      agentId,
    }: {
      clientCode: string;
      agentId: string;
    },
    loggingCtx: CommonLogContext
  ): Promise<ModifiedAgentData | null> => {
    const agentData = await mcsAgentSearch({ clientCode, agentId }, loggingCtx);

    if (agentData.error || !agentData.data) {
      throw new Error('No agent data recieved', {
        cause: { clientCode, agentId },
      });
    }

    const normalizedAgentData = transformMcsAgentData(agentData.data);

    return { ...normalizedAgentData, agentId };
  },
  {
    file: fileName,
    functionName: 'getAgentInformation',
  }
);
