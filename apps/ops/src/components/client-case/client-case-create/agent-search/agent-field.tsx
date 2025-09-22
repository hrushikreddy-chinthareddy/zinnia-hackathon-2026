import { useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { groupBy, sortBy, uniq } from 'lodash';
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
    ProducerSearchResult,
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
const useAgentAgencyIds = (sellingCodes: string[]) =>
    useHierarchyListQuery(
        sellingCodes,
        useCallback(
            (results: UseQueryResult<GetHierarchyResponse | null>[]) => {
                const agencyIds = results
                    .map((result) => result?.data)
                    .filter((data): data is GetHierarchyResponse => !!data)
                    .flatMap(({ upline }) =>
                        getNearestAgenciesFromUpline(upline)
                    )
                    .map((agency) => agency.sellingCode);

                return uniq(agencyIds);
            },
            []
        )
    );

const useNormalUserAgentOptions = (searchQuery: string) => {
    const { writeClientCaseCarriers } = usePermissionsContext();
    const isSuperIllustrator = !!writeClientCaseCarriers.length;

    const { data: agencies } = useAuthenticatedAgentAgencies();

    const sellingCodes =
        agencies?.map((agency) => agency.agentSellingCode) ?? [];

    const agencyIdsCombinedResult = useAgentAgencyIds(sellingCodes);

    const { data: agencyIds } = agencyIdsCombinedResult;

    const agentOptionsCombinedResult = useDownlineListQuery(
        !isSuperIllustrator && agencyIds ? agencyIds : [],
        searchQuery,
        useCallback(
            (results: UseQueryResult<GetDownlineResponse[][] | null>[]) => {
                const downlines = results
                    .map((result) => result?.data)
                    .flat(2)
                    .filter((data): data is GetDownlineResponse => !!data);

                const agentOptions = Object.entries(
                    groupBy(downlines, 'npn')
                ).map(([npn, downlines]) => {
                    const downlineWithDetails = downlines.find(
                        ({ firstName, lastName, emailAddress }) =>
                            firstName && lastName && emailAddress
                    );

                    return {
                        firstName: downlineWithDetails?.firstName,
                        lastName: downlineWithDetails?.lastName,
                        email: downlineWithDetails?.emailAddress,
                        npn,
                        sellingCodes: downlines
                            .map(({ sellingCode }) => sellingCode)
                            .filter(
                                (sellingCode): sellingCode is string =>
                                    !!sellingCode
                            ),
                    };
                });

                return agentOptions;
            },
            []
        )
    );

    return useReduceCombinedResults(
        agencyIdsCombinedResult,
        agentOptionsCombinedResult
    );
};

const useSuperIllustratorAgentOptions = (searchQuery: string) => {
    const { writeClientCaseCarriers } = usePermissionsContext();

    return useGetProducersListQuery(
        writeClientCaseCarriers,
        searchQuery,
        useCallback(
            (results: UseQueryResult<ProducersResponse>[]) =>
                sortBy(
                    results
                        .map((result) => result?.data?.producers)
                        .flat()
                        .filter(
                            (producer): producer is ProducerSearchResult =>
                                producer != null
                        )
                        .filter(
                            (producer) =>
                                producer.type ===
                                PRODUCER_SEARCH_RESULT_TYPES.INDIVIDUAL
                        )
                        .map(({ lookupId, name, email }) => ({
                            npn: lookupId,
                            firstName: name,
                            email,
                            // This endpoint does not return any agent selling
                            // code this is not a problem because we are gonna
                            // request them later
                            sellingCodes: [] as string[],
                        })),
                    'firstName'
                ),
            []
        )
    );
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

    const { data: agentData } = useGetProducerById(selectedAgentLookupId);

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
