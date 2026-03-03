import { uniq } from 'lodash';
import { useMemo } from 'react';
import { SetRequired } from 'type-fest';

import { SellingCodeWithCarrier } from '@deps/types/client-case';
import { Brand } from '@deps/utils/types';
import {
    AliasModel,
    PartyReferenceDataModel,
} from '@zinnia/api-types/types/partyreference';

const SELLING_CODE_FIELD = 'SELLING_CODE';

export enum IllustratorRole {
    SUPER_ILLUSTRATOR = 'SUPER_ILLUSTRATOR',
    DISTRICT_MANAGER = 'DISTRICT_MANAGER',
    DISTRICT_STAFF = 'DISTRICT_STAFF',
    AGENCY_OWNER = 'AGENCY_OWNER',
    AGENCY_STAFF = 'AGENCY_STAFF',
    AGENT = 'AGENT',
    NO_ROLE = 'NO_ROLE',
}

/**
 * To brand aliases that we know have an external party identifier with a
 * selling code
 */
export type AliasWithSellingCode = Brand<
    SetRequired<AliasModel, 'carrier' | 'externalPartyIds'>,
    'AliasWithSellingcode'
>;

/**
 * Filter aliases that have an external party identifier with a selling code
 */
export const filterAliasesWithSellingCode = (
    aliases: AliasModel[] | undefined
) => {
    if (!aliases) {
        return;
    }
    return aliases.filter(
        (alias) =>
            alias.carrier &&
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
        aliases
            ?.map((alias) => getSellingCodeFromAlias(alias))
            ?.filter(
                (obj): obj is SellingCodeWithCarrier =>
                    !!(obj?.sellingCode && obj?.carrierShortName)
            ) ?? []
    );

export const getSellingCodeFromAlias = (alias: AliasModel) => {
    const carrierShortName = alias.carrier?.toUpperCase();
    const sellingCode = alias.externalPartyIds?.find(
        (id) => id.key === SELLING_CODE_FIELD
    )?.value as string | undefined;

    if (!carrierShortName || !sellingCode) {
        return;
    }

    return {
        carrierShortName,
        sellingCode,
    };
};

export const getSellingCodeFromAliasWithSellingCode = (
    alias: AliasWithSellingCode
) => getSellingCodeFromAlias(alias)!;

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
