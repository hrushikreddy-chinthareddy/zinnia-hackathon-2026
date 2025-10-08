import { UseQueryResult } from '@tanstack/react-query';
import { AliasModel } from '@xd/api-types/dist/generated-types/partyreference';
// AgencyOption should be in types directory not in a helpers module
import { useCallback, useDebugValue, useMemo } from 'react';

import { AgentOption } from '@deps/components/client-case/client-case-create/agent-search/types';
import {
    AgencyOption,
    getCommonAgenciesFromHierarchies,
    getNearestAgenciesFromHierarchies,
} from '@deps/components/client-case/client-case-create/create-client-case-form/create-client-case-form.helpers';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import {
    GetHierarchyResponse,
    MAIN_AGENCY_ROLE,
    UplineItem,
} from '@deps/types/producers';

import { useHierarchyListQuery } from './pom';
import { AliasWithSellingCode } from './user-identity';

export const useAgencyOptions = (
    agentOption: AgentOption | undefined,
    aliasesWithSellingCodes: AliasWithSellingCode[] | undefined
) => {
    const { writeClientCaseCarriers } = usePermissionsContext();
    const isSuperIllustrator = !!writeClientCaseCarriers.length;
    // TODO: Add client case agent selling code retrival logic

    const authUserAliases = aliasesWithSellingCodes?.map((alias) => ({
        sellingCode: alias.externalPartyIds?.find(
            (id) => id.key === 'SELLING_CODE'
        )?.value as string,
        carrierShortName: alias.carrier,
        fullName:
            alias?.fullName || (alias?.firstName && alias?.lastName)
                ? `${alias?.firstName} ${alias?.lastName}`
                : undefined,
    }));

    const clientCaseAgentAliases = useMemo(() => {
        if (!agentOption?.sellingCodes?.length) {
            return [];
        }

        const { firstName, lastName, carrierShortName } = agentOption;

        return agentOption.sellingCodes.map((sellingCode) => ({
            sellingCode,
            carrierShortName,
            fullName:
                firstName && lastName
                    ? `${firstName} ${lastName}`
                    : firstName || lastName,
        }));
    }, [agentOption]);

    const hierarchyCombiner = useCallback(
        (results: UseQueryResult<GetHierarchyResponse | null>[]) =>
            results
                .map((result) => result.data)
                .filter((item): item is GetHierarchyResponse => !!item),
        []
    );

    const { data: authUserHierarchies } = useHierarchyListQuery(
        authUserAliases,
        hierarchyCombiner
    );

    const { data: clientCaseAgentHierarchies } = useHierarchyListQuery(
        clientCaseAgentAliases,
        hierarchyCombiner
    );

    const agencyOptions = useMemo(() => {
        // If the agent is an agency, return all "root-agencies" of the agent
        const rootAgencyOptions = clientCaseAgentHierarchies
            ?.filter(({ role }) => role === MAIN_AGENCY_ROLE)
            ?.map(({ sellingCode }) => {
                const agentData = clientCaseAgentAliases?.find(
                    (item) => item.sellingCode === sellingCode
                )!;

                return {
                    value: sellingCode,
                    textValue: agentData.fullName,
                    agentSellingCode: sellingCode,
                } as AgencyOption;
            });

        if (rootAgencyOptions?.length) {
            return rootAgencyOptions;
        }

        if (isSuperIllustrator) {
            const groupedAgencies = getNearestAgenciesFromHierarchies(
                clientCaseAgentHierarchies ?? []
            );

            const agencies = groupedAgencies.flatMap(
                ({ agentSellingCode, agencies }) =>
                    agencies.map((agency) => ({
                        agentSellingCode,
                        agency,
                    }))
            );

            return formatAgenciesForSelect(agencies);
        }

        if (authUserAliases == null) {
            // This is redundant. Normal agents should always have aliases. Just for Type narrowing
            console.error(`Agent does not have aliases`);
            return null;
        }

        const agenciesDropDownItems = getCommonAgenciesFromHierarchies(
            authUserHierarchies ?? [],
            clientCaseAgentHierarchies ?? []
        );

        return formatAgenciesForSelect(agenciesDropDownItems);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        authUserHierarchies,
        authUserAliases,
        clientCaseAgentHierarchies,
        clientCaseAgentAliases,
    ]);

    useDebugValue(agencyOptions);

    return agencyOptions;
};

const formatAgenciesForSelect = (
    agenciesWithSellingCode: { agentSellingCode: string; agency: UplineItem }[]
): AgencyOption[] | null => {
    if (!agenciesWithSellingCode.length) {
        return null;
    }

    return agenciesWithSellingCode.map(({ agentSellingCode, agency }) => {
        return {
            value: agency.sellingCode,
            agentSellingCode,
            textValue: agency.fullName
                ? agency.fullName
                : `${agency.firstName} ${agency.lastName}`,
        };
    });
};
