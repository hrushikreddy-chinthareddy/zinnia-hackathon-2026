import { UseQueryResult } from '@tanstack/react-query';
import { first, groupBy, zip } from 'lodash';
import { useCallback } from 'react';
import { Simplify } from 'type-fest';

import {
    getNearestAgenciesFromUpline,
    GetProducerByIdWrappedResponse,
    isAgency,
    useAuthenticatedAgentSellingCodes,
    useDownlineListQuery,
    useGetWrappedProducersByIdListQuery,
    useHierarchyListQuery,
} from '@deps/components/illustrations/helpers/hooks/pom';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { useReduceCombinedResults } from '@deps/hooks/combined-query';
import {
    Carrier,
    GetDownlineResponse,
    GetHierarchyResponse,
    UplineItem,
} from '@deps/types/producers';

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
    useGetWrappedProducersByIdListQuery(
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

/**
 * @deprecated superseeded by `useAgentSearchResults`
 */
export const useLegacyAgentSearchResults = (searchQuery: string) => {
    const { isSuperIllustrator } = usePermissionsContext();

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
