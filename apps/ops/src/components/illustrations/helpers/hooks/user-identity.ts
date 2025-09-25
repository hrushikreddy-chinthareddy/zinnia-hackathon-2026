import {
    AliasModel,
    PartyReferenceDataModel,
} from '@xd/api-types/dist/generated-types/partyreference';
import { identity, uniq } from 'lodash';
import { useMemo } from 'react';

import { Brand } from '@deps/utils/types';

const SELLING_CODE_FIELD = 'SELLING_CODE';

/**
 * To brand aliases that we know have an external party identifier with a
 * selling code
 */
export type AliasWithSellingCode = Brand<AliasModel, 'AliasWithSellingcode'>;

/**
 * Filter aliases that have an external party identifier with a selling code
 */
export const filterAliasesWithSellingCode = (
    aliases: AliasModel[] | undefined
) => {
    if (!aliases) {
        return;
    }
    return aliases.filter((alias) =>
        alias.externalPartyIds?.some((id) => id.key === SELLING_CODE_FIELD)
    ) as AliasWithSellingCode[];
};

/**
 * Hook that extracts selling codes from partyMetadata
 * @param partyMetadata as returned by the party reference api
 */
export const useAllAliasesWithSellingCode = (
    partyMetadata?: PartyReferenceDataModel
) => {
    const aliases = partyMetadata?.alias;
    return useMemo(() => filterAliasesWithSellingCode(aliases), [aliases]);
};

/**
 * Extracts all  agent sellingCodes from unfiltered aliases
 */
export const getSellingCodesFromAliases = (aliases: AliasModel[] | undefined) =>
    uniq(
        (aliases?.map(getSellingCodeFromAlias)?.filter(identity) as string[]) ??
            []
    );

export const getSellingCodeFromAlias = (
    alias: AliasModel
): string | undefined =>
    alias.externalPartyIds?.find((id) => id.key === SELLING_CODE_FIELD)?.value;

export const getSellingCodeFromAliasWithSellingCode = (
    alias: AliasWithSellingCode
): string => getSellingCodeFromAlias(alias)!;

// TODO: Confirm if this is the way to find the main alias
export const getMainAlias = (aliases: AliasWithSellingCode[]) => {
    if (!aliases?.length) {
        return;
    }

    const aliasWithAgentDetails = aliases.find(
        (alias: AliasWithSellingCode) =>
            // Need to confirm how to identify the main alias (if teher really is a way)
            // this fields are needed to show the selected agent name in the UI
            alias.firstName &&
            alias.lastName &&
            alias.email &&
            getSellingCodeFromAliasWithSellingCode(alias)
    );

    if (aliasWithAgentDetails) {
        return aliasWithAgentDetails;
    }

    // Fallback to any sellingcode
    return aliases[0];
};

export const getMainIdentyfiers = (aliases?: AliasWithSellingCode[]) => {
    if (!aliases) {
        return {
            mainAlias: undefined,
            mainSellingCode: undefined,
        };
    }

    const mainAlias = getMainAlias(aliases);
    const mainSellingCode =
        mainAlias && getSellingCodeFromAliasWithSellingCode(mainAlias);

    return {
        mainAlias,
        mainSellingCode,
    };
};
