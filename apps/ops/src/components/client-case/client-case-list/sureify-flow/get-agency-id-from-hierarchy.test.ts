import { getHierarchyBySellingCode } from '@deps/queries/api/server/v1/producers';
import { GetHierarchyResponse, Upline } from '@deps/types/producers';
import { LoggingContext } from '@deps/utils/server-logging';

import { getAgencyIdFromHierarchy } from './get-agency-id-from-hierarchy';

jest.mock('@deps/queries/api/server/v1/producers');

const getHierarchyBySellingCodeMock = jest.mocked(getHierarchyBySellingCode);
const loggingContext = {} as LoggingContext;

describe('getAgencyIdFromHierarchy', () => {
    it.each<[string, Partial<GetHierarchyResponse> | undefined]>([
        ['there is no response', undefined],
        [
            'there is sellingCode but it is not a main agency',
            {
                sellingCode: 'sellingCode',
                role: 'MidAgency',
            },
        ],
        ['there is no upline', {}],
        [
            'upline is empty',
            {
                upline: [],
            },
        ],
        [
            'the upline does not contain main agencies',
            {
                upline: [
                    {
                        role: 'MidAgency',
                        sellingCode: 'sellingCode',
                    } as Upline,
                ],
            },
        ],
    ])('Should return null when %s', async (_, getHierarchyResponse) => {
        getHierarchyBySellingCodeMock.mockResolvedValue(
            getHierarchyResponse as GetHierarchyResponse
        );

        const agencyId = await getAgencyIdFromHierarchy(
            'sellingCode',
            loggingContext
        );

        expect(agencyId).toBeNull();
    });

    it.each<[string, Partial<GetHierarchyResponse>]>([
        [
            'it is a main agency and have a selling code',
            {
                role: 'GeneralAgency',
                sellingCode: 'agencySellingCode',
            },
        ],
        [
            'it is not a main agency and there is a main agency in the upline',
            {
                role: 'MidAgency',
                sellingCode: 'mainSellingCode',
                upline: [
                    {
                        role: 'MidAgency',
                        sellingCode: 'midSellingCode',
                    },
                    {
                        role: 'GeneralAgency',
                        sellingCode: 'agencySellingCode',
                    },
                ] as Upline[],
            },
        ],
        [
            'there are multile main agencies in the upline',
            {
                role: 'MidAgency',
                sellingCode: 'mainSellingcode',
                upline: [
                    {
                        role: 'GeneralAgency',
                        sellingCode: 'agency2SellingCode',
                        level: 2,
                    },
                    {
                        role: 'MidAgency',
                        sellingCode: 'midSellingCode',
                        level: 1,
                    },
                    {
                        role: 'GeneralAgency',
                        sellingCode: 'agencySellingCode',
                        level: 1,
                    },
                ] as Upline[],
            },
        ],
    ])(
        'Should return the main agency sellingCode when %s',
        async (_, getHierarchyResponse) => {
            getHierarchyBySellingCodeMock.mockResolvedValue(
                getHierarchyResponse as GetHierarchyResponse
            );

            const agencyId = await getAgencyIdFromHierarchy(
                'sellingCode',
                loggingContext
            );

            expect(agencyId).toEqual('agencySellingCode');
        }
    );
});
