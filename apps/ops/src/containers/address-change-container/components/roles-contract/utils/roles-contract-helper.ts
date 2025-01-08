import { TFunction } from 'next-i18next';

import { RadioItem } from '@deps/components/radio/radio';
import { hasSameProperties } from '@deps/helpers/objects.helper';
import { toTitleCase } from '@deps/helpers/string.helper';
import {
    Address,
    AddressBase,
    PartyRole,
    Phone,
    PhoneType,
    Policy,
    PolicyAllOfPartiesItem,
    PolicyParties,
} from '@deps/models/policy/sor-policy';
import { TagKey } from '@deps/types/components';

import { AddressFieldsToMatchForRoleGroup, AllowedRoleTypes, custodialQualTypes, PhoneFieldsToMatchForRoleGroup } from './roles-contract-constants';
import { mapAddressToAddressCardData, mapPhoneToAddressCardData } from './roles-contract-mappers';
import { AssociateAddressTableRow, PartyAddressCard } from './roles-contract-types';
import { ApplyToRolesState, ContractUpdateOptions } from '../../../types/address-change-types';
import { getRoleToLabelKeyMap } from '../../../utils/address-change-helper';

const isAddressAndPhoneMatch = (address: Address | undefined, homePhone: Phone | undefined, policyParty: PolicyAllOfPartiesItem) => {
    const partyAddress = mapAddressToAddressCardData(policyParty?.addresses?.[0]);
    const partyHomePhone = mapPhoneToAddressCardData(policyParty.phones?.find(phone => phone.phoneType === PhoneType.HOME));
    const noPhoneExists = !partyHomePhone && !homePhone;
    const noAddressExists = !partyAddress && !address;
    return (
        (noAddressExists || hasSameProperties(address, mapAddressToAddressCardData(partyAddress), AddressFieldsToMatchForRoleGroup)) &&
        (noPhoneExists || hasSameProperties(homePhone, mapPhoneToAddressCardData(partyHomePhone), PhoneFieldsToMatchForRoleGroup))
    );
};

const isExistingEmail = (email: string, policyParty: PolicyAllOfPartiesItem )=>{
    return (
        typeof policyParty?.emails?.[0]?.emailAddress === 'string' &&
        email.toLowerCase().trim() === policyParty.emails[0].emailAddress.toLowerCase().trim()
    );
}

export const isRowAlreadySelected = (row: AssociateAddressTableRow, applyToRolesData: ApplyToRolesState) => {
    return (
        row.partyRole === applyToRolesData.partyRole &&
        row.policyNumber === applyToRolesData.policyNumber &&
        row.partyRoleId.toString() === applyToRolesData.partyRoleId.toString() &&
        row.partyId === applyToRolesData.partyId
    );
};


export const groupPartiesByAddress = (
    roles: PolicyParties[],
    parties: PolicyAllOfPartiesItem[],
    qualificationType: string,
    t: TFunction,
    getDefaultAddress: boolean = true
): PartyAddressCard[] => {
    const partyCards: PartyAddressCard[] = [];
    const extractedParties = parties ?? [];
    const extractedPartyRoles = roles ?? [];

    extractedPartyRoles?.map(partyItem => {
        const partyRole = partyItem.partyRole || '';
        const chipText = t(getRoleToLabelKeyMap(partyRole ?? ''));
        const convertedPartyRole: TagKey = {
            text: chipText,
        };

        const policyParty = extractedParties.find(pp => pp.partyId === partyItem.partyId);

        if (!policyParty) return;

        if (partyRole == PartyRole.OWNER && qualificationType && custodialQualTypes.includes(qualificationType)) {
            return;
        }

        const existingAddressCard = partyCards.find((item: PartyAddressCard) =>
            isAddressAndPhoneMatch(item?.address, item.homePhone, policyParty)
        );

        if (existingAddressCard) {
            const roleIndex = existingAddressCard.partyRoles.indexOf(partyRole);
            if (roleIndex === -1) {
                existingAddressCard.partyRoles.push(partyRole);
                existingAddressCard.tags.push(convertedPartyRole);
                existingAddressCard.roleIdentifiers.push({
                    partyId: partyItem.partyId || '',
                    partyRole: partyRole as PartyRole,
                    partyRoleId: partyItem.partyRoleId,
                });
            }
        } else {
            if (getDefaultAddress) {
                // todo: VS: remove eslint check after spec update
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const defaultAddress = policyParty.addresses?.find(address => address?.preferredAddress === true);
                const partyCard = {
                    address: mapAddressToAddressCardData(defaultAddress),
                    homePhone: mapPhoneToAddressCardData(policyParty.phones?.find(phone => phone.phoneType === PhoneType.HOME)),
                    partyRoles: [partyRole],
                    tags: [convertedPartyRole],
                    roleIdentifiers: [
                        {
                            partyId: partyItem.partyId || '',
                            partyRole: partyRole as PartyRole,
                            partyRoleId: partyItem.partyRoleId,
                        },
                    ],
                };
                partyCards.push(partyCard);
            } else {
                policyParty?.addresses?.map(address => {
                    const partyCard = {
                        address: { ...mapAddressToAddressCardData(address), addressType: address.addressType },
                        homePhone: mapPhoneToAddressCardData(policyParty.phones?.find(phone => phone.phoneType === PhoneType.HOME)),
                        partyRoles: [partyRole],
                        tags: [convertedPartyRole],
                        firstName: policyParty.firstName,
                        lastName: policyParty.lastName,
                        roleIdentifiers: [
                            {
                                partyId: partyItem.partyId || '',
                                partyRole: partyRole as PartyRole,
                                partyRoleId: partyItem.partyRoleId,
                            },
                        ],
                    };
                    partyCards.push(partyCard);
                });
            }
        }
    });
    return partyCards;
};

export const partyCardsEmail = (
    roles: PolicyParties[],
    parties: PolicyAllOfPartiesItem[],
    qualificationType: string,
    t: TFunction
): PartyAddressCard[] => {
    const partyCards: PartyAddressCard[] = [];
    const extractedParties = parties ?? [];
    const extractedPartyRoles = roles ?? [];

    extractedPartyRoles?.map(partyItem => {
        const partyRole = partyItem.partyRole || '';
        const chipText = t(getRoleToLabelKeyMap(partyRole ?? ''));

        const convertedPartyRole: TagKey = {
            text: chipText,
        };

        const policyParty = extractedParties.find(pp => pp.partyId === partyItem.partyId);

        if (!policyParty) return;

        if (partyRole == PartyRole.OWNER && qualificationType && custodialQualTypes.includes(qualificationType)) {
            return;
        }

        const existingEmailCard = partyCards.find((item: PartyAddressCard) => isExistingEmail(item?.email ?? '', policyParty));

        if (existingEmailCard) {
            const roleIndex = existingEmailCard.partyRoles.indexOf(partyRole);
            if (roleIndex === -1) {
                existingEmailCard.partyRoles.push(partyRole);
                existingEmailCard.tags.push(convertedPartyRole);
                existingEmailCard.roleIdentifiers.push({
                    partyId: partyItem.partyId || '',
                    partyRole: partyRole as PartyRole,
                    partyRoleId: partyItem.partyRoleId,
                });
            }
        } else {
            const emailId = policyParty?.emails?.[0]?.emailAddress ;
            if (emailId) {
                const partyCard = {
                    email: emailId,
                    partyRoles: [partyRole],
                    tags: [convertedPartyRole],
                    firstName: policyParty.firstName,
                    lastName: policyParty.lastName,
                    roleIdentifiers: [
                        {
                            partyId: partyItem.partyId || '',
                            partyRole: partyRole as PartyRole,
                            partyRoleId: partyItem.partyRoleId,
                        },
                    ],
                };
                partyCards.push(partyCard);
            }
        }
    });
    return partyCards;
};


export const getRolesRadioConfig = (roles: PolicyParties[], t: TFunction): RadioItem[] => {
    return (
        roles?.map(item => ({
            label: t(getRoleToLabelKeyMap(item?.partyRole ?? '')),
            value: item?.partyRoleId?.toString() ?? '',
        })) ?? []
    );
};

export const getContractSelectionRadioConfig = (policy: Policy, t: TFunction) => ({
    isRequired: false,
    selectOptions: [
        { label: `${t('rolesAndContracts.thisContractOnly')} ${policy?.policyNumber}`, value: ContractUpdateOptions.currentContract },
        { label: t('rolesAndContracts.selectContractIndividual'), value: ContractUpdateOptions.otherContract },
    ],
});

const getAddressLines = (address: AddressBase) => {
    const addressLines = [address?.addressLine1, address?.addressLine2, address?.addressLine3]
        .filter(Boolean)
        .map(line => toTitleCase(line))
        .join(', ');
    return addressLines;
};

export const getAssociatedTableData = (
    policyResponse: Policy[],
    applyToRolesState: ApplyToRolesState[],
    t: TFunction
): AssociateAddressTableRow[] => {
    return policyResponse
        .map(policy => {
            const extractedPartyRoles = policy?.partyRoles?.filter(role => AllowedRoleTypes.includes(role?.partyRole ?? '')) || [];
            return extractedPartyRoles.map(role => {
                const id = `${policy?.policyNumber}-${role?.partyRoleId}-${role?.partyId}`;
                const party = policy?.parties?.[0];
                const address = party?.addresses?.[0];
                const tableRow: AssociateAddressTableRow = {
                    id: id,
                    check: false,
                    policyNumber: policy?.policyNumber ?? '',
                    partyRoleId: role?.partyRoleId?.toString() ?? '',
                    partyRole: role?.partyRole ?? '',
                    partyRoleLabel: t(getRoleToLabelKeyMap(role?.partyRole ?? '')),
                    partyId: role?.partyId ?? '',
                    address: getAddressLines(address ?? {}),
                    city: address?.city ?? '',
                    state: address?.state ?? '',
                    zip: address?.zipCode ?? '',
                };
                const existingRecord = applyToRolesState.some(item => isRowAlreadySelected(tableRow, item));
                return {
                    ...tableRow,
                    check: existingRecord ? true : false,
                };
            });
        })
        .flatMap(item => item);
};
