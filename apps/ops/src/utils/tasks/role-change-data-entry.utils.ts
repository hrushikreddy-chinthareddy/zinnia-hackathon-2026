import { Action } from '@deps/constants/policy';

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
    defaultPartyId: string | null
) {
    switch (requestType) {
        case Action.UPDATE:
        case Action.DELETE:
            return deletedItem?.party?.partyId ?? null;
        case Action.ADD:
        default:
            return defaultPartyId;
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
