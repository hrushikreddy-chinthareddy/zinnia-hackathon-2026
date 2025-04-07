import { AgentData, ModifiedAgentData } from '@/types/agent';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { logError, logWarn } from '@/utils/logging/server-logging';

import { ApiResponse, ServerApi } from '..';
import { transformMcsAgentData } from './transformers';

export const mcsAgentSearch = async (
  { clientCode, agentId }: { clientCode: string; agentId: string }
  //TODO: fix type
): Promise<AgentData> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${clientCode}/salesentity?idType=external&skip=0&take=1&id=${agentId}&IsClientChild=true`;

  const rawResponse = await ServerApi.get(url);

  const response = await parseAPIResponse(rawResponse);

  if (!rawResponse?.ok) {
    const responseDetails = await logApiNotOkDetails({
      rawResponse,
      parsedResponse: response,
    });
    logError('Error retrieving agent information', {
      ...responseDetails,
      clientCode,
      agentId,
    });
    throw new Error('Error calling mcs search agent', {
      cause: response.status,
    });
  }

  return response.items?.[0];
};

export const getAgentInformation = async ({
  clientCode,
  agentId,
}: {
  clientCode: string;
  agentId: string;
}): Promise<ApiResponse<ModifiedAgentData>> => {
  try {
    const agentData = await mcsAgentSearch({ clientCode, agentId });
    const normalizedAgentData = transformMcsAgentData(agentData);
    return {
      data: { ...normalizedAgentData, agentId },
      error: null,
    };
  } catch (error) {
    logWarn('error thrown in getAgentInformation', { error });
    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getAgentInformation Error',
      },
    };
  }
};
