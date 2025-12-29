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

import { useAgencyOptions } from './use-agency-options';

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
    | 'agent-agency';

mockedGetUserHierarchyBySellingCode.mockImplementation(async (sellingCode) => {
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

    const brokerAgency = {
        firstName: 'Broker',
        lastName: 'Agency',
        middleName: '',
        fullName: 'Broker Agency',
        producerType: 'Corporation',
        addresses: [] as const,
        hierarchyId: 'broker-agency-hierarchy-id',
        level: 3,
        role: 'BrokerDealer',
        sellingCode: 'broker-agency',
        nationalProducerNumber: 'test-broker-agency',
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
                upline: [agency1, brokerAgency],
            } as GetHierarchyResponse;
        case 'single-other-agency':
            return {
                ...common,
                upline: [agency2, brokerAgency],
            } as GetHierarchyResponse;
        case 'agent-agency':
            return {
                ...common,
                upline: [agency1, brokerAgency],
                role: 'GeneralAgency',
            } as GetHierarchyResponse;
        default:
            throw new Error(`Invalid selling code: "${sellingCode}"`);
    }
});

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

describe('useAgencyOptions', () => {
    mockedUsePermissionsContext.mockImplementation(
        () =>
            ({
                writeclientCaseCarriers: [],
            } as unknown as PermissionsContextProps)
    );

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

        await waitFor(() => expect(result.current).not.toBeNull());

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

    it('returns only root agencies of the selected agent is there is any, for super-illustrator', async () => {
        const agentOption = {
            ...agentCommon,
            sellingCodes: ['agent-agency', 'single-agency'],
        };
        mockAsSuperIllustrator();
        const { result } = renderHook(() => useAgencyOptions(agentOption, []), {
            wrapper,
        });

        await waitFor(() => expect(result.current).not.toBeNull());

        expect(result.current).toEqual([
            {
                value: 'agent-agency',
                textValue: 'John Doe',
                agentSellingCode: 'agent-agency',
            },
        ]);
    });
});
