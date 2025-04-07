import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';

// TODO: fix types -- standardize
export const getAgentInformation = async ({
  clientCode,
  agentId,
}: {
  clientCode?: string;
  agentId?: string | null;
}) => {
  const response: ApiResponse<any> = await (
    await ClientApi.get(`/api/agent/${clientCode}?agentId=${agentId}`)
  ).json();
  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};
