import { useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { groupBy, sortBy, uniqBy, zip } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    getNearestAgenciesFromUpline,
    POM_QUERY_PREFIXES,
    useAuthenticatedAgentAgencies,
    useDownlineListQuery,
    useGetProducerById,
    useGetProducersListQuery,
    useHierarchyListQuery,
    useReduceCombinedResults,
} from '@deps/components/illustrations/helpers/hooks/pom';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import {
    GetDownlineResponse,
    GetHierarchyResponse,
    PRODUCER_SEARCH_RESULT_TYPES,
    ProducersResponse,
} from '@deps/types/producers';

import { AgentFieldContextProvider } from './agent-field-context';
import { GenericAgentField } from './generic-agent-field';
import { AgentOption } from './types';

/**
 * Returns the nearest agencies for each hierarchy of an agent
 *
 * @param sellingCodes Agent selling codes
 */
const useAgentAgencyIds = (
    params: { sellingCode: string; carrierShortName: string }[]
) =>
    useHierarchyListQuery(
        params,
        useCallback(
            (results: UseQueryResult<GetHierarchyResponse | null>[]) => {
                const agencyIds = results
                    .map((result) => result?.data)
                    .filter((data): data is GetHierarchyResponse => !!data)
                    .map(({ upline, carrier }) => ({
                        agencies: getNearestAgenciesFromUpline(upline),
                        carrier,
                    }))
                    .flatMap(({ agencies, carrier }) =>
                        agencies.map((agency) => ({
                            sellingCode: agency.sellingCode,
                            carrierShortName: carrier.carrierShortName,
                        }))
                    );

                return uniqBy(agencyIds, 'sellingCode');
            },
            []
        )
    );

const useNormalUserAgentOptions = (searchQuery: string) => {
    const { writeClientCaseCarriers } = usePermissionsContext();
    const isSuperIllustrator = !!writeClientCaseCarriers.length;

    const { data: authAgencyData } = useAuthenticatedAgentAgencies();

    const sellingCodes =
        authAgencyData?.map((agency) => ({
            sellingCode: agency.agentSellingCode,
            carrierShortName: agency.carrierShortName,
        })) ?? [];

    const agencyIdsCombinedResult = useAgentAgencyIds(sellingCodes);

    const { data: agencyIds } = agencyIdsCombinedResult;

    const agentOptionsCombinedResult = useDownlineListQuery(
        !isSuperIllustrator ? agencyIds ?? [] : [],
        {
            partialFullName: searchQuery,
            combine: useCallback(
                (
                    results: UseQueryResult<GetDownlineResponse[][] | null>[]
                ): AgentOption[] => {
                    const downlines = zip(results, authAgencyData!).flatMap(
                        ([result, authAgencyData]) =>
                            (result?.data?.flat(2) ?? []).map((downline) => ({
                                ...downline,
                                carrierShortName:
                                    authAgencyData!.carrierShortName,
                            }))
                    );

                    const agentOptions = Object.entries(
                        groupBy(downlines, 'npn')
                    ).map(([npn, downline]) => {
                        const downlineWithDetails = downline.find(
                            ({ firstName, lastName, emailAddress }) =>
                                firstName && lastName && emailAddress
                        );

                        return {
                            firstName: downlineWithDetails?.firstName,
                            lastName: downlineWithDetails?.lastName,
                            email: downlineWithDetails?.emailAddress,
                            npn,
                            carrierShortName: downline[0].carrierShortName,
                            sellingCodes: downline
                                .map(({ sellingCode }) => sellingCode)
                                .filter(
                                    (sellingCode): sellingCode is string =>
                                        !!sellingCode
                                ),
                        };
                    });

                    return agentOptions;
                },
                [authAgencyData]
            ),
        }
    );

    return useReduceCombinedResults(
        agencyIdsCombinedResult,
        agentOptionsCombinedResult
    );
};

const useSuperIllustratorAgentOptions = (searchQuery: string) => {
    const { writeClientCaseCarriers } = usePermissionsContext();

    return useGetProducersListQuery(writeClientCaseCarriers, {
        partialFullName: searchQuery,
        combine: useCallback(
            (results: UseQueryResult<ProducersResponse>[]) =>
                sortBy(
                    uniqBy(
                        zip(results, writeClientCaseCarriers)
                            .flatMap(
                                ([result, carrierShortName]) =>
                                    result?.data?.producers.map((producer) => ({
                                        ...producer,
                                        carrierShortName: carrierShortName!,
                                    })) ?? []
                            )
                            .filter(
                                (producer) =>
                                    producer.type ===
                                    PRODUCER_SEARCH_RESULT_TYPES.INDIVIDUAL
                            )
                            .map(
                                ({ lookupId, name, email, carrierShortName }) =>
                                    ({
                                        lookupId,
                                        firstName: name,
                                        email,
                                        carrierShortName,
                                        // This endpoint does not return any agent selling
                                        // code this is not a problem because we are gonna
                                        // request them later
                                        sellingCodes: [] as string[],
                                    } as AgentOption)
                            ),
                        'lookupId'
                    ),
                    'firstName'
                ),
            [writeClientCaseCarriers]
        ),
    });
};

const useAgentOptions = (searchQuery: string) => {
    const { writeClientCaseCarriers } = usePermissionsContext();

    const normalUserAgentOptionsResult = useNormalUserAgentOptions(searchQuery);
    const superIllustratorAgentOptionsResult =
        useSuperIllustratorAgentOptions(searchQuery);

    const isSuperIllustrator = !!writeClientCaseCarriers.length;
    return isSuperIllustrator
        ? superIllustratorAgentOptionsResult
        : normalUserAgentOptionsResult;
};

/**
 *
 */
const useSubscribeToProducerData = (
    selectedAgent: AgentOption | undefined,
    onSelectAgent: (agentOption: AgentOption) => void
) => {
    const selectedAgentLookupId = selectedAgent?.lookupId || selectedAgent?.npn;

    const { data: agentData } = useGetProducerById(
        selectedAgentLookupId,
        selectedAgent?.carrierShortName
    );

    useEffect(() => {
        if (!selectedAgent) {
            // Do nothing if there's no selected agent
            return;
        }

        const newSellingCodes = Object.values(
            agentData?.carrierSellingCodeRoles ?? {}
        )
            .flat()
            .map(({ sellingCode }) => sellingCode);

        const { npn, lookupId } = selectedAgent;

        if (
            selectedAgentLookupId &&
            ![npn, lookupId].includes(selectedAgentLookupId)
        ) {
            // Sanity check, this code should never execute
            console.error(`${lookupId} is not in ${[npn, lookupId]}`);
            return;
        }

        const oldSellingcodeSet = new Set(selectedAgent?.sellingCodes);
        const newSellingCodeSet = new Set(newSellingCodes);

        const hasNewSellingCodes =
            newSellingCodeSet.symmetricDifference(oldSellingcodeSet).size;

        onSelectAgent({
            ...selectedAgent,
            // Update agent details
            ...(agentData
                ? {
                      firstName:
                          agentData?.firstName ?? selectedAgent?.firstName,
                      lastName: agentData?.lastName ?? selectedAgent?.lastName,
                      npn:
                          agentData?.nationalProducerNumber ??
                          selectedAgent?.npn,
                  }
                : {}),
            // Combine both sellingCode sets
            ...(hasNewSellingCodes
                ? {
                      sellingCodes: Array.from(
                          oldSellingcodeSet.union(newSellingCodeSet)
                      ),
                  }
                : {}),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAgent, agentData, onSelectAgent]);
};

type AgentFieldProps = {
    value: AgentOption | undefined;
    onSelectAgent: (option: AgentOption) => void;
    editable: boolean;
};

export const AgentField = ({
    value,
    editable,
    onSelectAgent,
}: AgentFieldProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();
    useSubscribeToProducerData(value, onSelectAgent);

    const { data, isLoading, isFetching } = useAgentOptions(searchQuery);

    const handleSearch = useCallback((query: string) => {
        queryClient.invalidateQueries({
            queryKey: POM_QUERY_PREFIXES.GET_DOWNLINE_BY_SELLING_CODE,
        });
        queryClient.invalidateQueries({
            queryKey: POM_QUERY_PREFIXES.GET_PRODUCERS_BY_NAME_AND_CARRIER,
        });

        setSearchQuery(query);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const contextValue = useMemo(
        () => ({
            agentDetails: value,
            agentOptions: data,
            selectAgent: onSelectAgent,
            search: handleSearch,
            searchQuery: searchQuery,
            isLoading,
            isFetching,
            error: undefined, // TODO: handle errors
        }),
        [
            value,
            searchQuery,
            data,
            isLoading,
            isFetching,
            onSelectAgent,
            handleSearch,
        ]
    );

    return (
        <AgentFieldContextProvider value={contextValue}>
            <GenericAgentField editable={editable} />
        </AgentFieldContextProvider>
    );
};
