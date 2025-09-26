import { IllustrationAgentDetails } from '@deps/types/illustrations';
import { Prettify } from '@deps/utils/types';

export type AgentOption = Prettify<
    Pick<IllustrationAgentDetails, 'firstName' | 'lastName' | 'email'> & {
        sellingCodes: string[];
        npn?: string;
        lookupId?: string;
        carrierShortName: string;
    }
>;
