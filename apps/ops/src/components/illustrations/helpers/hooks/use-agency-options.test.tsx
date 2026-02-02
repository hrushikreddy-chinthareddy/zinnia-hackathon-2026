import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

import { AgentOption } from '@deps/components/client-case/client-case-create/agent-search/types';
import {
    PermissionsContextProps,
    usePermissionsContext,
} from '@deps/contexts/PermissionsContext';
import { getUserHierarchyBySellingCode } from '@deps/queries/tanstack/producerQueries/producerQueries';
import { GetHierarchyResponse, UplineItem } from '@deps/types/producers';
import { AliasModel } from '@zinnia/api-types/types/partyreference';

import { useAgencyOptions } from './use-agency-options';
import { AliasWithSellingCode } from './user-identity';

jest.mock('@deps/queries/tanstack/producerQueries/producerQueries');
jest.mock('@deps/contexts/PermissionsContext');

const mockedUsePermissionsContext = jest.mocked(usePermissionsContext);
const mockedGetUserHierarchyBySellingCode = jest.mocked(
    getUserHierarchyBySellingCode
);

type MockSellingCode =
    | 'no-upline'
    | 'single-agency'
    | 'single-other-agency'
    | 'agent-other-district'
    | 'agency-owner'
    | 'agency-owner-other-district'
    | 'agency-without-district'
    | 'district-manager'
    | 'other-district-manager';

const mockedGetUserHierarchyBySellingCodeImpl = async (sellingCode: string) => {
    const agency1 = {
        firstName: 'Some',
        lastName: 'Agency',
        middleName: '',
        fullName: 'Some Agency',
        producerType: 'Corporation',
        addresses: [] as const,
        hierarchyId: 'some-agency-hierarchy-id',
        level: 2,
        role: 'GeneralAgency',
        sellingCode: 'some-agency',
        nationalProducerNumber: 'test-agency',
    } satisfies UplineItem;

    const agency2 = {
        firstName: 'Some Other',
        lastName: 'Agency',
        middleName: '',
        fullName: 'Some Other Agency',
        producerType: 'Corporation',
        addresses: [] as const,
        hierarchyId: 'some-other-agency-hierarchy-id',
        level: 2,
        role: 'GeneralAgency',
        sellingCode: 'some-other-agency',
        nationalProducerNumber: 'test-other-agency',
    } satisfies UplineItem;

    const agencyOtherDistrict = {
        firstName: 'Some Other District',
        lastName: 'Agency',
        middleName: '',
        fullName: 'Other District Agency',
        producerType: 'Corporation',
        addresses: [] as const,
        hierarchyId: 'other-district-agency-hierarchy-id',
        level: 2,
        role: 'GeneralAgency',
        sellingCode: 'other-district-agency',
        nationalProducerNumber: 'test-other-district-agency',
    } satisfies UplineItem;

    const brokerDealer = {
        firstName: 'Broker',
        lastName: 'Dealer',
        middleName: '',
        fullName: 'Broker Dealer',
        producerType: 'Corporation',
        addresses: [] as const,
        hierarchyId: 'broker-dealer-hierarchy-id',
        level: 3,
        role: 'BrokerDealer',
        sellingCode: 'district-manager',
        nationalProducerNumber: 'test-broker-dealer',
    } satisfies UplineItem;

    const otherBrokerDealer = {
        firstName: 'Other',
        lastName: 'Broker Dealer',
        middleName: '',
        fullName: 'Other Broker Dealer',
        producerType: 'Corporation',
        addresses: [] as const,
        hierarchyId: 'other-broker-dealer-hierarchy-id',
        level: 3,
        role: 'BrokerDealer',
        sellingCode: 'other-district-manager',
        nationalProducerNumber: 'test-other-broker-dealer',
    } satisfies UplineItem;

    const common = {
        sellingCode,
        producerLookupId: 'test-agent',
        carrier: {
            carrierShortName: 'FNWL',
            name: 'Farmers',
            id: 'farmers-id',
        },
        upline: [agency1],
        products: [] as const,
        role: 'Rep',
        effectiveDate: '',
        level: 1,
    } satisfies Partial<GetHierarchyResponse>;

    switch (sellingCode as MockSellingCode) {
        case 'no-upline':
            return {
                ...common,
                upline: [],
            } as GetHierarchyResponse;
        case 'single-agency':
            return {
                ...common,
                upline: [agency1, brokerDealer],
            } as GetHierarchyResponse;
        case 'single-other-agency':
            return {
                ...common,
                upline: [agency2, brokerDealer],
            } as GetHierarchyResponse;
        case 'agent-other-district':
            return {
                ...common,
                upline: [agencyOtherDistrict, otherBrokerDealer],
            } as GetHierarchyResponse;
        case 'agency-owner':
            return {
                ...common,
                upline: [brokerDealer],
                role: 'GeneralAgency',
            } as GetHierarchyResponse;
        case 'agency-without-district':
            return {
                ...common,
                upline: [],
                role: 'GeneralAgency',
            };
        case 'district-manager':
            return {
                ...common,
                upline: [],
                role: 'BrokerDealer',
            } as GetHierarchyResponse;
        case 'other-district-manager':
            return {
                ...common,
                upline: [],
                role: 'BrokerDealer',
            } as GetHierarchyResponse;
        case 'agency-owner-other-district':
            return {
                ...common,
                upline: [brokerDealer],
                role: 'GeneralAgency',
            } as GetHierarchyResponse;
        default:
            throw new Error(`Invalid selling code: "${sellingCode}"`);
    }
};

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}> {children} </QueryClientProvider>
);

beforeEach(() => {
    jest.clearAllMocks();
});

const mockAsSuperIllustrator = () => {
    mockedUsePermissionsContext.mockImplementation(
        () =>
            ({
                writeClientCaseCarriers: ['FNWL'],
                isSuperIllustrator: true,
            } as unknown as PermissionsContextProps)
    );
};

const mockNonsuperIllustrator = () =>
    mockedUsePermissionsContext.mockImplementation(
        () =>
            ({
                writeclientCaseCarriers: [],
                isSuperIllustrator: false,
            } as unknown as PermissionsContextProps)
    );

describe('useAgencyOptions', () => {
    beforeAll(() => {
        mockedGetUserHierarchyBySellingCode.mockImplementation(
            mockedGetUserHierarchyBySellingCodeImpl
        );
    });

    const agentCommon = {
        firstName: 'John',
        lastName: 'Doe',
        carrierShortName: 'FNWL',
        sellingCodes: [],
    } satisfies AgentOption;

    it('returns all agencies of the selected agent, for super-illustrator', async () => {
        const agentOption = {
            ...agentCommon,
            sellingCodes: ['single-agency', 'single-other-agency'],
        };
        mockAsSuperIllustrator();
        const { result } = renderHook(() => useAgencyOptions(agentOption, []), {
            wrapper,
        });

        await waitFor(() => expect(result.current).not.toHaveLength(0));

        expect(result.current).toEqual([
            {
                value: 'some-agency',
                textValue: 'Some Agency',
                agentSellingCode: 'single-agency',
            },
            {
                value: 'some-other-agency',
                textValue: 'Some Other Agency',
                agentSellingCode: 'single-other-agency',
            },
        ]);
    });

    it('returns agency owners, for super-illustrator', async () => {
        const agentOption = {
            ...agentCommon,
            sellingCodes: ['agency-owner', 'single-agency'],
        };
        mockAsSuperIllustrator();
        const { result } = renderHook(() => useAgencyOptions(agentOption, []), {
            wrapper,
        });

        await waitFor(() => expect(result.current).not.toHaveLength(0));

        expect(result.current).toEqual([
            {
                value: 'agency-owner',
                textValue: 'John Doe',
                agentSellingCode: 'agency-owner',
            },
            {
                value: 'some-agency',
                textValue: 'Some Agency',
                agentSellingCode: 'single-agency',
            },
        ]);
    });

    it('filters by district, for district managers', async () => {
        mockNonsuperIllustrator();

        const agentOption = {
            ...agentCommon,
            sellingCodes: ['single-agency', 'agent-other-district'],
        };
        const districtManagerAliases = [
            {
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                carrier: 'FNWL',
                externalPartyIds: [
                    {
                        key: 'SELLING_CODE',
                        value: 'district-manager',
                    },
                ],
            },
        ] as AliasModel[] as AliasWithSellingCode[];

        const { result } = renderHook(
            () => useAgencyOptions(agentOption, districtManagerAliases),
            {
                wrapper,
            }
        );

        await waitFor(() => expect(result.current).not.toHaveLength(0));

        expect(result.current).toEqual([
            {
                textValue: 'Some Agency',
                value: 'some-agency',
                agentSellingCode: 'single-agency',
            },
        ]);
    });

    it('does not filter, agencies without a BrokerDealer', async () => {
        mockNonsuperIllustrator();

        const agentOption = {
            ...agentCommon,
            sellingCodes: ['agency-without-district'],
        };
        const aliases = [
            {
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                carrier: 'FNWL',
                externalPartyIds: [
                    {
                        key: 'SELLING_CODE',
                        value: 'agency-without-district',
                    },
                ],
            },
        ] as AliasModel[] as AliasWithSellingCode[];

        const { result } = renderHook(
            () => useAgencyOptions(agentOption, aliases),
            {
                wrapper,
            }
        );

        await waitFor(() => expect(result.current).toHaveLength(1));
    });
});
