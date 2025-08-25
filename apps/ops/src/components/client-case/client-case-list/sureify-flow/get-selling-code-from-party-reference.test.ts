import { getPartyReferenceByPartyId } from '@deps/queries/api/server/v1/party-reference';
import { PartyReference } from '@deps/types/party-reference';
import { LoggingContext } from '@deps/utils/server-logging';

import { getSellingcodeFromPartyReference } from './get-selling-code-from-party-reference';

jest.mock('@deps/queries/api/server/v1/party-reference');

const getPartyReferenceByPartyIdMock = jest.mocked(getPartyReferenceByPartyId);
const loggingContext = {} as LoggingContext;

describe('getSellingcodeFromPartyReference', () => {
    it.each<[string, Partial<PartyReference> | undefined]>([
        ['party reference does not exist', undefined],
        [
            'there is no valid alias',
            {
                email: 'test@example.com',
                alias: [
                    {
                        email: 'tested@example.com',
                    },
                ],
            },
        ],
        [
            'there are no external party ids',
            {
                email: 'test@example.com',
                alias: [
                    {
                        email: 'test@example.com',
                    },
                ],
            },
        ],
        [
            'external party ids is empty',
            {
                email: 'test@example.com',
                alias: [
                    {
                        email: 'test@example.com',
                        externalPartyIds: [],
                    },
                ],
            },
        ],
        [
            'there is no selling code and AOR or UPN party references',
            {
                email: 'test@example.com',
                alias: [
                    {
                        email: 'test@example.com',
                        externalPartyIds: [
                            {
                                key: 'TEST',
                                value: 'tested',
                            },
                        ],
                    },
                ],
            },
        ],
    ])('Should return null when %s', async (_, partyReference) => {
        getPartyReferenceByPartyIdMock.mockResolvedValue(
            partyReference as PartyReference
        );

        const sellingCode = await getSellingcodeFromPartyReference(
            'partyId',
            loggingContext
        );

        expect(sellingCode).toBeNull();
    });

    it.each<[string, string, Partial<PartyReference> | undefined]>([
        [
            'there is selling code party reference',
            'selling_code',
            {
                email: 'test@example.com',
                alias: [
                    {
                        email: 'test@example.com',
                        externalPartyIds: [
                            {
                                key: 'SELLING_CODE',
                                value: 'selling_code',
                            },
                        ],
                    },
                ],
            },
        ],
        [
            'there is an AOR and UPN party references',
            'aorupn',
            {
                email: 'test@example.com',
                alias: [
                    {
                        email: 'test@example.com',
                        externalPartyIds: [
                            {
                                key: 'AOR',
                                value: 'aor',
                            },
                            {
                                key: 'UPN',
                                value: 'upn',
                            },
                        ],
                    },
                ],
            },
        ],
    ])(
        'Should return a selling code when %s',
        async (_, expected, partyReference) => {
            getPartyReferenceByPartyIdMock.mockResolvedValue(
                partyReference as PartyReference
            );

            const sellingCode = await getSellingcodeFromPartyReference(
                'partyId',
                loggingContext
            );

            expect(sellingCode).toEqual(expected);
        }
    );
});
