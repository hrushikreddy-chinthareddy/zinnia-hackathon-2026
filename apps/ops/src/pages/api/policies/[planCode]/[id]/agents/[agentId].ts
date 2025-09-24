import { getSession } from '@auth0/nextjs-auth0';
import { Policy } from '@zinnia/api-types/types/sor';
import { AxiosResponse } from 'axios';

import { PRODUCERS_API_ORIGIN } from '@deps/queries/api/server/v1/producers';
import { apiServerBaseUrl, policyApiBaseUrl } from '@deps/queries/api-config';
import { serverApi, StatusCode } from '@deps/queries/api-utils/serverApiClient';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import { EnterpriseTokenApi } from '@deps/services/enterprise-api-token-http';
import { agentPartySanitizer } from '@deps/utils/sanitizers';
import {
    logWarn,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

/// Tries to get agent information for a policy
// NOTE: this uses a Machine-to-Machine token, so we want to be certain the user has access to the policy
// and agent on the policy before returning this information
// If the policy is available to the user, then they are permitted to view party data
// So, by checking that they can get the policy AND that the agent is a part of this policy, we've made sure they can see this agent info
export default withAuthAndLogging(
    async (req, res, loggingContext) => {
        const session = await getSession(req, res);
        const { id, planCode, agentId } = req.query;

        const policyRequest = await serverApi.get<
            any,
            AxiosResponse<{ data: Policy }>
        >(
            `${policyApiBaseUrl}/${planCode}/${id}?viewDetails=true`,
            { authorization: 'Bearer ' + session?.accessToken },
            loggingContext
        );

        // If they can't see this policy, they can't get the agent information
        if (policyRequest?.status !== StatusCode.OK) {
            return res.status(policyRequest.status).json({
                error: `Error retrieving policy: ${policyRequest.statusText}`,
            });
        }
        const agentData = policyRequest?.data?.data?.parties?.find(
            (party) => party?.agentExternalId === agentId
        );

        if (!agentData) {
            return res
                .status(404)
                .json({ error: 'Agent external id not found on policy' });
        }

        try {
            const agentDataUrl = `${apiServerBaseUrl}/distributors/v1/producers/search?limit=10&offset=0`;
            const agentDataBody = {
                searchType: 'SellingCode',
                searchValue: agentId,
            };

            const agentDataResponse = await EnterpriseTokenApi.post(
                agentDataUrl,
                JSON.stringify(agentDataBody),
                {
                    headers: { 'Content-Type': 'application/json' },
                },
                loggingContext
            );
            const agentDataResponseObject = await agentDataResponse.json();

            if (agentDataResponseObject.message) {
                throwTypedError(
                    agentDataResponseObject.message,
                    PRODUCERS_API_ORIGIN
                );
            }

            if (agentDataResponseObject?.results?.[0]) {
                return res.json(
                    agentPartySanitizer(agentDataResponseObject.results[0])
                );
            }
        } catch (error: any) {
            logWarn('getPolicyAgentDetails:error', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            return res.status(500).json(error);
        }
    },
    { file: 'polices/:planCode/:id/agents/:agentId', function: 'routeHandler' }
);
