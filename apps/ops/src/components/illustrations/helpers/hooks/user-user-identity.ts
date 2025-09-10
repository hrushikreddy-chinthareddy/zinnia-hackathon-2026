import {
    AliasModel,
    PartyReferenceDataModel,
} from '@xd/api-types/dist/generated-types/partyreference';

//Maybe rename this to userUserSellingCodes
export const useUserIdentity = () => {
    const SELLING_CODE_FIELD = 'SELLING_CODE';

    const findAllAliasesWithSellingCode = (
        party: PartyReferenceDataModel | undefined
    ): AliasModel[] => {
        if (!party) {
            return [];
        }
        return party.alias.filter((alias) =>
            alias.externalPartyIds?.some((id) => id.key === SELLING_CODE_FIELD)
        );
    };

    const getLoggedInAgentSellingCode = (aliases: AliasModel[]) => {
        const firstAlias = aliases[0];
        const loggedInAgentAlias = aliases.length > 0 ? firstAlias : null;

        const findSellingCodeFromAlias = (alias: AliasModel): string => {
            return alias.externalPartyIds?.find(
                (id) => id.key === SELLING_CODE_FIELD
            )?.value;
        };

        return loggedInAgentAlias
            ? findSellingCodeFromAlias(loggedInAgentAlias)
            : '';
    };

    const getSellingCodesFromAliases = (
        aliasesWithSellingCode: AliasModel[]
    ) => {
        const getSellingCodeFromAlias = (alias: AliasModel): string => {
            return alias.externalPartyIds?.find(
                (id) => id.key === SELLING_CODE_FIELD
            )?.value;
        };

        return aliasesWithSellingCode
            .map(getSellingCodeFromAlias)
            .filter(Boolean);
    };

    // TODO: Confirm if this is the way to find the main alias
    const getMainAlias = (aliasesWithSellingCode: AliasModel[]) => {
        if (!aliasesWithSellingCode?.length) {
            return null;
        }

        const aliasWithAgentDetails = aliasesWithSellingCode.find(
            (alias: AliasModel) => {
                return (
                    // Need to confirm how to identify the main alias (if teher really is a way)
                    // this fields are needed to show the selected agent name in the UI
                    alias.firstName &&
                    alias.lastName &&
                    alias.email &&
                    alias.externalPartyIds?.find(
                        (id) => id.key === SELLING_CODE_FIELD
                    )
                );
            }
        );

        if (aliasWithAgentDetails) {
            return aliasWithAgentDetails;
        }

        // Fallback to any sellingcode
        return aliasesWithSellingCode[0];
    };

    const getMainIdentyfiers = (aliasesWithSellingCode: AliasModel[]) => {
        const mainAlias = getMainAlias(aliasesWithSellingCode);
        const mainSellingCode: string | undefined =
            mainAlias?.externalPartyIds?.find(
                (id) => id.key === SELLING_CODE_FIELD
            )?.value;

        return {
            mainAlias,
            mainSellingCode,
        };
    };

    return {
        findAllAliasesWithSellingCode,
        getSellingCodesFromAliases,
        getMainIdentyfiers,
        getLoggedInAgentSellingCode,
    };
};
