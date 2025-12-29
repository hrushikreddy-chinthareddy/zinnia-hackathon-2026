import { party } from '@deps/types/new-business';
import { LoggingContext } from '@deps/utils/server-logging';

import { getAgentSellingCode } from './get-agent-selling-code';
import { getSellingcodeFromPartyReference } from './get-selling-code-from-party-reference';

jest.mock('./get-selling-code-from-party-reference');

const getSellingcodeFromPartyReferenceMock = jest.mocked(
    getSellingcodeFromPartyReference
);

describe('getAgentSellingCode', () => {
    const logCtx = {} as LoggingContext;
    it('builds the selling code from AOR and UPN', async () => {
        const agentSellingCode = await getAgentSellingCode(
            {
                identifiers: [
                    {
                        type: 'EXTERNAL',
                        key: 'AOR',
                        value: 'agent',
                    },
                    {
                        type: 'EXTERNAL',
                        key: 'UPN',
                        value: 'code',
                    },
                ],
                partyId: 'agent-party-id',
            } as party,
            logCtx
        );

        expect(getSellingcodeFromPartyReferenceMock).not.toHaveBeenCalled();
        expect(agentSellingCode).toEqual('agentcode');
    });

    it('Fetches the selling code from party reference', async () => {
        getSellingcodeFromPartyReferenceMock.mockResolvedValue('agentcode');

        const agentSellingCode = await getAgentSellingCode(
            {
                identifiers: [],
                partyId: 'agent-party-id',
            } as unknown as party,
            logCtx
        );

        expect(getSellingcodeFromPartyReferenceMock).toHaveBeenCalledWith(
            'agent-party-id',
            expect.anything()
        );
        expect(agentSellingCode).toEqual('agentcode');
    });
});
