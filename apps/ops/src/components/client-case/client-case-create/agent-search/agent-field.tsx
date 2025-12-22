import { useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { first, groupBy, sortBy, uniqBy, zip } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Simplify } from 'type-fest';

import {
    getNearestAgenciesFromUpline,
    GetProducerByIdWrappedResponse,
    isAgency,
    POM_QUERY_PREFIXES,
    useAuthenticatedAgentSellingCodes,
    useDownlineListQuery,
    useGetProducerById,
    useGetProducersByIdListQuery,
    useGetProducersListQuery,
    useHierarchyListQuery,
} from '@deps/components/illustrations/helpers/hooks/pom';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { useReduceCombinedResults } from '@deps/hooks/combined-query';
import {
    Carrier,
    GetDownlineResponse,
    GetHierarchyResponse,
    PRODUCER_SEARCH_RESULT_TYPES,
    ProducersResponse,
    UplineItem,
} from '@deps/types/producers';

import { AgentFieldContextProvider } from './agent-field-context';
import { GenericAgentField } from './generic-agent-field';
import { AgentOption } from './types';

const useAgentHierarchies = (
    params: { sellingCode: string; carrierShortName: string }[]
) =>
    useHierarchyListQuery(
        params,
        useCallback(
            (results: UseQueryResult<GetHierarchyResponse | null>[]) => {
                const hierarchies = results
                    .map((result) => result?.data)
                    .filter((data): data is GetHierarchyResponse => !!data);

                const agencies = hierarchies
                    .map((hierarchy) => {
                        const { upline, carrier } = hierarchy;

                        return {
                            agency: isAgency(hierarchy)
                                ? hierarchy
                                : first(getNearestAgenciesFromUpline(upline)),
                            carrier,
                        };
                    })
                    .filter(
                        (
                            item
                        ): item is {
                            agency: UplineItem | GetHierarchyResponse;
                            carrier: Carrier;
                        } => !!item.agency
                    );

                return {
                    hierarchies,
                    producerLookUpParams: hierarchies.map(
                        ({ producerLookupId, carrier }) => ({
                            lookupId: producerLookupId,
                            carrierShortName: carrier.carrierShortName,
                        })
                    ),
                    agencyLookupParams: agencies.map(
                        ({ agency: { sellingCode }, carrier }) => ({
                            sellingCode,
                            carrierShortName: carrier.carrierShortName,
                        })
                    ),
                };
            },
            []
        )
    );

const useAgentOptionsFromSellingCodes = (
    params: { lookupId: string; carrierShortName: string }[],
    { partialFullName }: { partialFullName: string }
) =>
    useGetProducersByIdListQuery(
        params,
        useCallback(
            (
                results: UseQueryResult<GetProducerByIdWrappedResponse | null>[]
            ) =>
                results
                    .map((result) => result?.data)
                    .filter(
                        (
                            data
                        ): data is Simplify<
                            GetProducerByIdWrappedResponse & {
                                response: NonNullable<unknown>;
                            }
                        > => !!data && !!data.response
                    )
                    .map(
                        ({
                            response: {
                                firstName,
                                lastName,
                                fullName,
                                middleName,
                                email,
                                nationalProducerNumber,
                                carrierSellingCodeRoles,
                            },
                            carrierShortName,
                        }) => ({
                            firstName: firstName,
                            lastName,
                            fullName,
                            middleName,
                            emailAddress: email,
                            npn: nationalProducerNumber,
                            carrierShortName,
                            carrierSellingCodeRoles,
                        })
                    )
                    .filter(({ firstName, middleName, lastName, fullName }) =>
                        [
                            `${firstName} ${middleName} ${lastName}`,
                            `${firstName} ${lastName}`,
                            fullName,
                        ].some((refString) =>
                            refString
                                ?.toLowerCase()
                                .includes(partialFullName.toLowerCase())
                        )
                    )
                    .flatMap(
                        (option) =>
                            option.carrierSellingCodeRoles?.[
                                option.carrierShortName
                            ]?.map(({ sellingCode, role }) => ({
                                sellingCode,
                                role,
                                ...option,
                            })) ?? []
                    ),
            [partialFullName]
        )
    );

const useNormalUserAgentOptions = (searchQuery: string) => {
    const { writeClientCaseCarriers } = usePermissionsContext();
    const isSuperIllustrator = !!writeClientCaseCarriers.length;

    const agentSellingCodes = useAuthenticatedAgentSellingCodes();
    const { data: { producerLookUpParams, agencyLookupParams } = {} } =
        useAgentHierarchies(agentSellingCodes);

    const selfAgentOptionsCombinedResult = useAgentOptionsFromSellingCodes(
        producerLookUpParams ?? [],
        { partialFullName: searchQuery }
    );

    const { data: selfAgentOptions } = selfAgentOptionsCombinedResult;

    const agentOptionsCombinedResult = useDownlineListQuery(
        !isSuperIllustrator ? agencyLookupParams ?? [] : [],
        {
            partialFullName: searchQuery,
            combine: useCallback(
                (
                    results: UseQueryResult<GetDownlineResponse[][] | null>[]
                ): AgentOption[] => {
                    const downlines = zip(
                        results,
                        agencyLookupParams ?? []
                    ).flatMap(([result, agencyLookupParams]) =>
                        (result?.data?.flat(2) ?? []).map((downline) => ({
                            ...downline,
                            carrierShortName:
                                agencyLookupParams!.carrierShortName,
                        }))
                    );

                    const downLinesWithSelfOptions = [
                        ...downlines,
                        ...(selfAgentOptions ?? []),
                    ].filter(
                        ({ role, firstName, lastName }) =>
                            role === 'Rep' || (firstName && lastName)
                    );

                    const agentOptions = Object.entries(
                        groupBy(downLinesWithSelfOptions, 'npn')
                    ).map(([npn, sameNpnDownlines]) => {
                        const downlineWithDetails = sameNpnDownlines.find(
                            ({ firstName, lastName, emailAddress }) =>
                                firstName && lastName && emailAddress
                        );

                        return {
                            firstName: downlineWithDetails?.firstName,
                            lastName: downlineWithDetails?.lastName,
                            email: downlineWithDetails?.emailAddress,
                            npn,
                            carrierShortName:
                                sameNpnDownlines[0].carrierShortName,
                            sellingCodes: sameNpnDownlines
                                .map(({ sellingCode }) => sellingCode)
                                .filter(
                                    (sellingCode): sellingCode is string =>
                                        !!sellingCode
                                ),
                        };
                    });

                    return agentOptions;
                },
                [agencyLookupParams, selfAgentOptions]
            ),
        }
    );

    return useReduceCombinedResults(
        selfAgentOptionsCombinedResult,
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

    const { data: { response: agentData } = {} } = useGetProducerById(
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
