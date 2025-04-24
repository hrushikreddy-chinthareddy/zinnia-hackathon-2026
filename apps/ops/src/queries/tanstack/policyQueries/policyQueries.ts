import { hasCookie } from 'cookies-next';

import { NameTag } from '@deps/containers/people-sub-page/people-sub-page.helpers';
import AgentParty from '@deps/helpers/policy-sor/AgentParty';
import { getAgentData } from '@deps/queries/api/agents';
import { fetchPolicy, searchPolicy } from '@deps/queries/api/policies';
import { MOCK_COOKIE_KEY } from '@deps/queries/api-utils/serverClientUtils';
import { getMockPolicy } from '@deps/services/mocks/mock-policy.helper';
import { SearchViewQuery } from '@deps/types/search';

export const getPolicyQuery = async (id: string, planCode: string) => {
    const isMocked = hasCookie(MOCK_COOKIE_KEY);
    if (isMocked) {
        return getMockPolicy();
    }

    const response = await fetchPolicy(id, planCode);
    if (!response) {
        throw 'No policy found';
    }

    return response;
};

export const getPoliciesQuery = async (value: SearchViewQuery, limit: number, offset: number) => {
    const transformedValue = Object.fromEntries(
        Object.entries(value).map(([key, val]) => (key === 'ssn' ? [key, val?.replaceAll('-', '')] : [key, val]))
    );

    const response = await searchPolicy(transformedValue, { limit, offset });

    if (!response) {
        throw 'No policies found';
    }

    return response;
};

export const getAgentPartiesDataQuery = async (agentParties: NameTag[], clientCode?: string, policyNumber?: string, planCode?: string) => {
    const agentDataPromises = agentParties.map(agent =>
        getAgentData({
            clientCode,
            id: agent.agentExternalId,
            policyNumber,
            planCode,
        }).then(result => (result ? new AgentParty(result, agent) : null))
    );

    const results = await Promise.all(agentDataPromises);
    return results.filter(agent => agent !== null);
};
