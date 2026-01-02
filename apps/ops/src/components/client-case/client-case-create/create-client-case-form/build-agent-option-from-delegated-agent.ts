import { DelegatedAgent } from '@deps/components/illustrations/helpers/queries/agent-search/types';
import { AgentOption } from 'components/client-case/client-case-create/agent-search/types';

export const buildAgentOptionFromDelegatedAgent = ({
    firstName,
    lastName,
    email,
    sellingCodes,
    npn,
    lookupId,
    carrierShortName,
}: DelegatedAgent): AgentOption => ({
    firstName,
    lastName,
    email,
    sellingCodes,
    npn,
    lookupId,
    carrierShortName,
});
