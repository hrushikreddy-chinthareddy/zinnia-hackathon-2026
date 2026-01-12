import { UseQueryResult } from '@tanstack/react-query';
import { zip } from 'lodash';
import { useDebugValue, useMemo } from 'react';
import { SetNonNullable } from 'type-fest';

import { AgentOption } from '@deps/components/client-case/client-case-create/agent-search/types';
import { AgencyOption } from '@deps/components/client-case/client-case-create/create-client-case-form/create-client-case-form.helpers';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { GetHierarchyResponse, UplineItem } from '@deps/types/producers';

import {
    getHierarchyAgency,
    getHierarchyBrokerDealer,
    getIllustratorRoleFromHierarchy,
    useHierarchyListQuery,
} from './pom';
import { AliasWithSellingCode, IllustratorRole } from './user-identity';

type SelectableAgency = {
    agentSellingCode: string;
    agentFullName: string | undefined;
    agency: GetHierarchyResponse | UplineItem;
    brokerDealer: GetHierarchyResponse | UplineItem;
};

type HierarchySummary = {
    hierarchy: GetHierarchyResponse;
    agency: UplineItem | GetHierarchyResponse | null;
    brokerDealer: UplineItem | GetHierarchyResponse | null;
    role: IllustratorRole;
    alias: {
        sellingCode: string;
        carrierShortName: string;
        fullName: string | undefined;
    };
};

/**
 * Returns true if the hierarchy allows delegating to this agency
 */
const isAgencyValidForHierarchy = (
    { agency, brokerDealer }: SelectableAgency,
    authUserHierarchy: HierarchySummary
) => {
    const role = authUserHierarchy.role;

    if (
        [
            IllustratorRole.DISTRICT_MANAGER,
            IllustratorRole.DISTRICT_STAFF,
        ].includes(role)
    ) {
        return (
            brokerDealer.sellingCode ===
            authUserHierarchy.brokerDealer?.sellingCode
        );
    }

    if (role === IllustratorRole.AGENCY_OWNER) {
        return agency.sellingCode === authUserHierarchy.hierarchy.sellingCode;
    }

    if ([IllustratorRole.AGENCY_STAFF, IllustratorRole.AGENT].includes(role)) {
        return agency.sellingCode === authUserHierarchy.agency?.sellingCode;
    }

    return false;
};

const filterValidSelectedAgentAgencies = (
    agencies: SelectableAgency[],
    authUserHierarchies: HierarchySummary[]
) =>
    agencies.filter((selectableAgency) =>
        authUserHierarchies?.some((authUserHierarchy) =>
            isAgencyValidForHierarchy(selectableAgency, authUserHierarchy)
        )
    );

const buildSelectedAgentAgencies = (
    selectedAgentHierarchies: HierarchySummary[]
): SelectableAgency[] =>
    selectedAgentHierarchies
        .filter(
            (
                item
            ): item is SetNonNullable<typeof item, 'agency' | 'brokerDealer'> =>
                !!item.agency && !!item.brokerDealer
        )
        .map(({ alias, agency, brokerDealer }) => ({
            agentSellingCode: alias.sellingCode,
            agentFullName: alias.fullName,
            agency,
            brokerDealer,
        }));

const buildAgencyOption = ({
    agency,
    agentSellingCode,
    agentFullName,
}: SelectableAgency): AgencyOption => {
    return {
        value: agency.sellingCode,
        agentSellingCode,
        textValue:
            'fullName' in agency
                ? agency.fullName || `${agency.firstName} ${agency.lastName}`
                : agentFullName ?? '',
    };
};

const hierarchyCombiner =
    (
        aliases: {
            sellingCode: string;
            carrierShortName: string;
            fullName: string | undefined;
        }[]
    ) =>
    (
        results: UseQueryResult<GetHierarchyResponse | null>[]
    ): HierarchySummary[] =>
        zip(results, aliases ?? [])
            .map(([result, alias]) => ({
                hierarchy: result?.data,
                alias,
            }))
            .filter(
                (
                    item
                ): item is {
                    hierarchy: GetHierarchyResponse;
                    alias: {
                        sellingCode: string;
                        carrierShortName: string;
                        fullName: string | undefined;
                    };
                } =>
                    !!item.hierarchy &&
                    !!item.alias?.sellingCode &&
                    !!item.alias?.carrierShortName
            )
            .map(({ hierarchy, alias }) => ({
                hierarchy,
                agency: getHierarchyAgency(hierarchy),
                brokerDealer: getHierarchyBrokerDealer(hierarchy),
                role: getIllustratorRoleFromHierarchy(hierarchy),
                alias,
            }));

export const useAgencyOptions = (
    agentOption: AgentOption | undefined,
    aliasesWithSellingCodes: AliasWithSellingCode[] | undefined
) => {
    const { isSuperIllustrator } = usePermissionsContext();

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

    const { data: authUserHierarchies } = useHierarchyListQuery(
        authUserAliases,
        useMemo(
            () => hierarchyCombiner(authUserAliases ?? []),
            [authUserAliases]
        )
    );

    const { data: selectedAgentHierarchies } = useHierarchyListQuery(
        clientCaseAgentAliases,
        useMemo(
            () => hierarchyCombiner(clientCaseAgentAliases),
            [clientCaseAgentAliases]
        )
    );

    const validAgentAgencies = useMemo(() => {
        if (!selectedAgentHierarchies?.length) {
            return [];
        }

        const selectedAgentAgencies = buildSelectedAgentAgencies(
            selectedAgentHierarchies
        );

        if (isSuperIllustrator) {
            // Can select any agency
            return selectedAgentAgencies;
        }

        if (authUserHierarchies == null) {
            // Authenticated user hierarchies are still pending
            return [];
        }

        return filterValidSelectedAgentAgencies(
            selectedAgentAgencies,
            authUserHierarchies
        );
    }, [isSuperIllustrator, authUserHierarchies, selectedAgentHierarchies]);

    const agencyOptions = validAgentAgencies
        .map(buildAgencyOption)
        .filter(({ textValue }) => !!textValue);

    useDebugValue(agencyOptions);

    return agencyOptions;
};
