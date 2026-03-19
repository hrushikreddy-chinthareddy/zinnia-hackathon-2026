import { Action } from '@deps/constants/policy';
import { Party } from '@deps/containers/task-container/task-handlers/types';
import { toTitleCase } from '@deps/helpers/string.helpers';

export interface RoleChangeActionItem {
    action: Action | string;
    party?: any;
}

export interface RoleChangeDetectionResult {
    requestType: Action;
    addedItem: RoleChangeActionItem | null;
    deletedItem: RoleChangeActionItem | null;
}

export function detectRoleChangeRequestType(
    actionData: any[]
): RoleChangeDetectionResult {
    const addedItem = actionData.find((a) => a.action === Action.ADD) ?? null;
    const deletedItem =
        actionData.find((a) => a.action === Action.DELETE) ?? null;

    let requestType = Action.NONE;
    if (addedItem && deletedItem) requestType = Action.UPDATE;
    else if (addedItem) requestType = Action.ADD;
    else if (deletedItem) requestType = Action.DELETE;

    return { requestType, addedItem, deletedItem };
}

export function resolveRoleChangePartyId(
    requestType: Action,
    deletedItem: RoleChangeActionItem | null,
    _defaultPartyId: string | null
) {
    switch (requestType) {
        case Action.UPDATE:
        case Action.DELETE:
            return deletedItem?.party?.partyId ?? null;
        case Action.ADD:
        default:
            return '';
    }
}

export function cleanAddresses(arr: any[] = []) {
    if (!Array.isArray(arr)) return null;

    const cleaned = arr.filter((a) => {
        const hasType = !!a?.addressType;
        const hasValue = a?.addressLine1 && a?.city && a?.state && a?.zipCode;
        return hasType && hasValue;
    });

    return cleaned.length > 0 ? cleaned : null;
}

export function cleanEmails(arr: any[] = []) {
    if (!Array.isArray(arr)) return null;

    const cleaned = arr.filter((e) => e?.emailType && e?.emailAddress);
    return cleaned.length > 0 ? cleaned : null;
}

export function cleanPhones(arr: any[] = []) {
    if (!Array.isArray(arr)) return null;

    const cleaned = arr.filter((p) => p?.phoneType && p?.dialNumber);
    cleaned.forEach((phone) => {
        const dialNumber =
            phone.dialNumber.length === 7
                ? phone.dialNumber
                : phone?.dialNumber.slice(-7) ?? null;
        const areaCode =
            phone.dialNumber.length > 7
                ? phone.dialNumber.slice(-10, -7)
                : phone?.areaCode ?? null;
        const countryCode =
            phone?.dialNumber && phone.dialNumber.length > 10
                ? phone.dialNumber.slice(0, -10)
                : phone?.countryCode ?? null;

        phone.dialNumber = dialNumber;
        phone.areaCode = areaCode;
        phone.countryCode = countryCode;
    });
    return cleaned.length > 0 ? cleaned : null;
}

export function mergeIdentifications(ids: any[]) {
    const defaultSSN = {
        identificationValue: null,
        identificationType: 'SSN',
        startDate: null,
        endDate: null,
    };

    if (!ids || ids.length === 0) return [defaultSSN];
    return [{ ...defaultSSN, ...ids[0] }];
}

export function getDefaultRoleChangeParty() {
    return {
        partyType: null,
        prefix: null,
        firstName: null,
        middleName: null,
        lastName: null,
        fullName: null,
        entityType: null,
        dateOfBirth: null,
        gender: null,
        trustType: null,
        trustDate: null,
        relationshipToTheCurrentOwner: null,
        identifications: mergeIdentifications([]),
        addresses: null,
        emails: null,
        phones: null,
        collateralAmount: null,
        startDate: null,
        endDate: null,
    };
}
export const toFullName = (party: Party): string | null => {
    const suffix = party.suffix;

    const baseName = toTitleCase(
        [party.prefix, party.firstName, party.middleName, party.lastName]
            .filter(Boolean)
            .join(' ')
    );

    const full = [baseName, suffix].filter(Boolean).join(' ');
    return full || null;
};
