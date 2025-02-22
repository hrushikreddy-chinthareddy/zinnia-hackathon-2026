import { AxiosResponse } from 'axios';

import { client } from '@deps/queries/api-utils/client';
import { AgentData, AgentDataResponse } from '@deps/types/agents';

import { baseAppUrl } from '../api-config';

type GetAgentDataQuery = {
    clientCode: string | undefined;
    id: string | undefined;
    policyNumber: string | undefined;
    planCode: string | undefined;
};

export const getAgentData = async ({ clientCode, id, policyNumber, planCode }: GetAgentDataQuery): Promise<AgentData | undefined> => {
    try {
        let url = `${baseAppUrl}/api/api/${clientCode}/salesentity?idType=external&skip=0&take=1&id=${id}`;
        if (policyNumber && planCode) {
            url += `&policyNumber=${policyNumber}&planCode=${planCode}`;
        }
        const response = await client.get<AgentDataResponse, AxiosResponse<AgentDataResponse>>(url);

        const agentData = response?.data?.items?.[0];

        if (!agentData) {
            return undefined;
        }

        return agentData;
    } catch (error: any) {
        console.error('An error occurred while requesting transactions', error);
        return undefined;
    }
};
