import { getStateCode } from '@deps/helpers/states.helpers';
import {
    Address,
    AddressTypes,
    PartyRoles,
} from '@deps/models/case/withdrawal/case';
import { Address as SorAddress } from '@zinnia/api-types/types/sor';

type SorAddressWithLine4 = SorAddress & { addressLine4?: string | null };
type SorAddressWithPreferred = SorAddress & { preferredAddress?: boolean };

/** Minimal party shape: has partyId and optional addresses. Accepts LifeCadParty and Party. */
type PartyWithAddresses = { partyId?: string; addresses?: unknown[] };

/** Minimal role shape: has partyRole and partyId. */
type PartyRoleWithId = { partyRole?: unknown; partyId?: string };

/**
 * Finds the annuitant party in partyRoles, then returns that party's preferred address from parties.
 * Returns undefined if no annuitant, no matching party, or no preferred address.
 */
export function getAnnuitantPreferredAddressFromParties(
    parties: PartyWithAddresses[],
    partyRoles: PartyRoleWithId[]
): SorAddress | undefined {
    const annuitantPartyId = partyRoles.find(
        (role) => String(role.partyRole) === PartyRoles.ANNUITANT
    )?.partyId;
    const annuitantParty = parties.find(
        (party) => party.partyId === annuitantPartyId
    );
    const addresses = annuitantParty?.addresses as SorAddress[] | undefined;
    return addresses?.filter(
        (address: SorAddress) =>
            (address as SorAddressWithPreferred).preferredAddress
    )[0];
}

/**
 * Maps a preferred SOR address (e.g. from party.addresses) to the form Address type.
 * Used when building annuitant address for DLIC disbursement options in withdrawal and SSW forms.
 */
export function mapSorPreferredAddressToAddress(
    preferredAddressFromParty: SorAddress
): Address {
    const addressWithLine4 = preferredAddressFromParty as SorAddressWithLine4;
    return {
        addressLine1: preferredAddressFromParty.addressLine1 ?? '',
        addressLine2: preferredAddressFromParty.addressLine2 ?? null,
        addressLine3: preferredAddressFromParty.addressLine3 ?? null,
        addressLine4: addressWithLine4.addressLine4 ?? null,
        addressType:
            (preferredAddressFromParty.addressType as
                | AddressTypes
                | undefined) ?? AddressTypes.DEFAULT,
        city: preferredAddressFromParty.city ?? null,
        country: preferredAddressFromParty.country ?? null,
        state: getStateCode(String(preferredAddressFromParty.state ?? '')),
        zip: preferredAddressFromParty.zipCode ?? '',
        zipPlusFour: preferredAddressFromParty.zipCodeExtension ?? null,
    };
}
