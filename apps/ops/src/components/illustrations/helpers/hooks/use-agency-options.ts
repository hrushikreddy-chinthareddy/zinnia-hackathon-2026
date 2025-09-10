import { useQuery } from '@tanstack/react-query';
import { AliasModel } from '@xd/api-types/dist/generated-types/partyreference';

// AgencyOption hosuld be in types fodler not in a helper class
import {
    AgencyOption,
    getAgenciesFromHierarchy,
} from '@deps/components/client-case/client-case-create/create-client-case-form/create-client-case-form.helpers';
import { getUserHierarchyListBySellingCode } from '@deps/queries/tanstack/producerQueries/producerQueries';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import { MAIN_AGENCY_ROLE, Upline } from '@deps/types/producers';

export const useAgencyOptions = (
    clientCase: Partial<IllustrationsClientCase> | undefined,
    aliasesWithSellingCodes: AliasModel[]
) => {
    // TODO: Add client case agent selling code retrival logic

    const clientCaseAgentDetails = clientCase?.agentDetails;
    const authUserAliases = aliasesWithSellingCodes.map((alias) => ({
        sellingCode: alias.externalPartyIds?.find(
            (id) => id.key === 'SELLING_CODE'
        )?.value as string,
        fullName:
            alias?.fullName || (alias?.firstName && alias?.lastName)
                ? `${alias?.firstName} ${alias?.lastName}`
                : undefined,
    }));

    // TODO: this should be an array from the client case selected agent (because the agent can have more than one selling code)
    const clientCaseAgentAliases = clientCaseAgentDetails?.sellingCode
        ? [
              {
                  sellingCode: clientCaseAgentDetails?.sellingCode,
                  fullName: `${clientCaseAgentDetails?.firstName} ${clientCaseAgentDetails?.lastName}`,
              },
          ]
        : [];

    const authUserSellingCodes = authUserAliases.map(
        ({ sellingCode }) => sellingCode
    );

    const clientCaseAgentSellingCodes = clientCaseAgentAliases
        .map(({ sellingCode }) => sellingCode || '')
        .filter((sellingCode) => !!sellingCode);

    const { data } = useQuery({
        queryKey: [
            'agentHierarchy',
            ...authUserSellingCodes,
            ...clientCaseAgentSellingCodes,
        ],
        queryFn: () =>
            Promise.all([
                getUserHierarchyListBySellingCode(authUserSellingCodes),
                getUserHierarchyListBySellingCode(clientCaseAgentSellingCodes),
            ]),
        enabled: !!authUserSellingCodes.length,
    });

    if (!data) {
        return [];
    }

    const [authUserHerarchies, clientCaseAgentHerarchy] = data;

    const rootAgencyOptions = authUserHerarchies
        .filter(({ role }) => role === MAIN_AGENCY_ROLE)
        .map(({ sellingCode }) => {
            const agentData = authUserAliases
                .concat(clientCaseAgentAliases)
                .find((item) => item.sellingCode === sellingCode)!;

            // In this case the agencyId should be the same as the agentSellingCode
            // But we'are not sure, so just ignore it
            return {
                value: sellingCode,
                textValue: agentData.fullName,
            } as AgencyOption;
        });

    if (rootAgencyOptions.length) {
        // TODO: what about if I have two alias that are genral_agencies in diferent herarchies. What are the criteria to choose?
        const FIRST_GENERAL_AGENCY = 0;
        return [rootAgencyOptions[FIRST_GENERAL_AGENCY]];
    }

    const agenciesDropDownItems = getAgenciesFromHierarchy(
        authUserHerarchies,
        clientCaseAgentHerarchy
    );

    return formatAgenciesForSelect(agenciesDropDownItems);
};

const formatAgenciesForSelect = (
    agenciesWithSellingCode: { agentSellingCode?: string; agency: Upline }[]
): AgencyOption[] => {
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
