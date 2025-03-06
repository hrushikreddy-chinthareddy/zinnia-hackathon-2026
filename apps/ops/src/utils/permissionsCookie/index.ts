import { PermissionsCookie } from '@deps/types/permissionsCookie';

export const checkForTuple = (
    permissions: PermissionsCookie | undefined,
    relation: string,
    tupleObject: string,
    carrier?: string
): boolean | undefined => {
    if (!relation || !permissions) {
        return undefined;
    }
    if (carrier && permissions?.carriers?.[relation]?.includes(carrier)) {
        return true;
    }
    if (!tupleObject) {
        return undefined;
    }
    return permissions?.tuples?.[relation]?.[tupleObject];
};

export const checkForCarrier = (permissions: PermissionsCookie | undefined, relation: string): string[] | undefined => {
    if (!relation || !permissions) {
        return undefined;
    }
    return permissions?.carriers?.[relation];
};
