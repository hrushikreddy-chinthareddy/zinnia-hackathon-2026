import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { AliasModel } from '@xd/api-types/dist/generated-types/partyreference';
// AgencyOption should be in types directory not in a helpers module
import { useCallback, useDebugValue, useEffect, useMemo } from 'react';

import { AgentOption } from '@deps/components/client-case/client-case-create/agent-search/types';
import {
    AgencyOption,
    getCommonAgenciesFromHierarchies,
    getNearestAgenciesFromHierarchies,
} from '@deps/components/client-case/client-case-create/create-client-case-form/create-client-case-form.helpers';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { getUserHierarchyListBySellingCode } from '@deps/queries/tanstack/producerQueries/producerQueries';
import {
    GetHierarchyResponse,
    MAIN_AGENCY_ROLE,
    UplineItem,
} from '@deps/types/producers';

import { isAgency, useHierarchyListQuery } from './pom';

export const useAgencyOptions = (
    agentOption: AgentOption | undefined,
    aliasesWithSellingCodes: AliasModel[] | undefined
) => {
    const { writeClientCaseCarriers } = usePermissionsContext();
    const isSuperIllustrator = !!writeClientCaseCarriers.length;
    // TODO: Add client case agent selling code retrival logic

    const authUserAliases = aliasesWithSellingCodes?.map((alias) => ({
        sellingCode: alias.externalPartyIds?.find(
            (id) => id.key === 'SELLING_CODE'
        )?.value as string,
        fullName:
            alias?.fullName || (alias?.firstName && alias?.lastName)
                ? `${alias?.firstName} ${alias?.lastName}`
                : undefined,
    }));

    const clientCaseAgentAliases = useMemo(() => {
        if (!agentOption?.sellingCodes?.length) {
            return [];
        }

        const { firstName, lastName } = agentOption;

        return agentOption.sellingCodes.map((sellingCode) => ({
            sellingCode,
            fullName:
                firstName && lastName
                    ? `${firstName} ${lastName}`
                    : firstName || lastName,
        }));
    }, [agentOption]);

    const authUserSellingCodes = authUserAliases?.map(
        ({ sellingCode }) => sellingCode
    );

    const clientCaseAgentSellingCodes = clientCaseAgentAliases
        .map(({ sellingCode }) => sellingCode || '')
        .filter((sellingCode) => !!sellingCode);

    const hierarchyCombiner = useCallback(
        (results: UseQueryResult<GetHierarchyResponse | null>[]) =>
            results
                .map((result) => result.data)
                .filter((item): item is GetHierarchyResponse => !!item),
        []
    );

    const { data: authUserHierarchies } = useHierarchyListQuery(
        authUserSellingCodes ?? [],
        hierarchyCombiner
    );

    const { data: clientCaseAgentHierarchy } = useHierarchyListQuery(
        clientCaseAgentSellingCodes,
        hierarchyCombiner
    );

    const agencyOptions = useMemo(() => {
        if (isSuperIllustrator) {
            const groupedAgencies = getNearestAgenciesFromHierarchies(
                clientCaseAgentHierarchy ?? []
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

        const rootAgencyOptions = authUserHierarchies
            ?.filter(({ role }) => role === MAIN_AGENCY_ROLE)
            ?.map(({ sellingCode }) => {
                const agentData = authUserAliases
                    .concat(clientCaseAgentAliases)
                    .find((item) => item.sellingCode === sellingCode)!;

                return {
                    value: sellingCode,
                    textValue: agentData.fullName,
                    agentSellingCode: sellingCode,
                } as AgencyOption;
            });

        if (rootAgencyOptions?.length) {
            // TODO: what about if I have two alias that are genral_agencies in diferent herarchies. What are the criteria to choose?
            const FIRST_GENERAL_AGENCY = 0;
            return [rootAgencyOptions[FIRST_GENERAL_AGENCY]];
        }

        const agenciesDropDownItems = getCommonAgenciesFromHierarchies(
            authUserHierarchies ?? [],
            clientCaseAgentHierarchy ?? []
        );

        return formatAgenciesForSelect(agenciesDropDownItems);
    }, [
        authUserHierarchies,
        authUserAliases,
        clientCaseAgentHierarchy,
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
