import { getCookie } from 'cookies-next';

import { PERMISSIONS_COOKIE_NAME, PermissionsCookie } from '@deps/types/permissionsCookie';

export const addTupleToCookie = (relation: string, tupleObject: string, result: boolean, req?: any, res?: any) => {
    return;
    // try {
    //     const permissionsCookie = getCookie(PERMISSIONS_COOKIE_NAME, { req, res }) ?? DEFAULT_PERMISSIONS_COOKIE;
    //     const permissions = JSON.parse(permissionsCookie) as PermissionsCookie;
    //     if (!permissions.tuples?.[relation]) {
    //         permissions.tuples[relation] = {};
    //     }
    //     permissions.tuples[relation][tupleObject] = result;
    //     setCookie(PERMISSIONS_COOKIE_NAME, JSON.stringify(permissions), { req, res });
    // } catch (error) {
    //     logWarn('addTupleToCookie::An error occurred while adding tuple to cookie', error);
    // }
};

export const addCarrierListToCookie = (relation: string, carrierList: string[], req?: any, res?: any) => {
    return;
    // try {
    //     const permissionsCookie = getCookie(PERMISSIONS_COOKIE_NAME, { req, res }) ?? DEFAULT_PERMISSIONS_COOKIE;
    //     const permissions = JSON.parse(permissionsCookie) as PermissionsCookie;
    //     permissions.carriers[relation] = carrierList;
    //     setCookie(PERMISSIONS_COOKIE_NAME, JSON.stringify(permissions), { req, res });
    // } catch (error) {
    //     logWarn('addCarrierListToCookie::An error occurred while adding carrier list to cookie', error);
    // }
};

export const doesPermissionsHaveCarrierRelation = (relation: string, carrier: string, req?: any, res?: any): boolean => {
    try {
        if (!relation || !carrier) {
            throw new Error('Missing carrier or relation');
        }

        const permissionsCookie = getCookie(PERMISSIONS_COOKIE_NAME, { req, res });
        if (!permissionsCookie) {
            return false;
        }

        const permissions = JSON.parse(permissionsCookie) as PermissionsCookie;
        return !!permissions.carriers?.[relation]?.includes(carrier);
    } catch (error) {
        console.error('checkPermissionsCookieForCarrier::An error occurred while checking permissions cookie', error);
        return false;
    }
};

export const checkPermissionsCookieForTuple = (relation: string, tupleObject: string, req?: any, res?: any): boolean | undefined => {
    try {
        if (!relation || !tupleObject) {
            throw new Error('Missing relation or tupleObject');
        }

        const permissionsCookie = getCookie(PERMISSIONS_COOKIE_NAME, { req, res });
        if (!permissionsCookie) {
            return undefined;
        }

        const permissions = JSON.parse(permissionsCookie) as PermissionsCookie;
        return permissions.tuples?.[relation]?.[tupleObject];
    } catch (error) {
        console.error('checkPermissionsCookieForTuple::An error occurred while checking permissions cookie', error);
        return undefined;
    }
};

// check if the permissions object has the carrier list for the relation provided
export const checkPermissionsCookieForCarrierList = (relation: string, req?: any, res?: any): string[] | undefined => {
    try {
        if (!relation) {
            throw new Error('Missing relation');
        }

        const permissionsCookie = getCookie(PERMISSIONS_COOKIE_NAME, { req, res });
        if (!permissionsCookie) {
            return undefined;
        }

        const permissions = JSON.parse(permissionsCookie) as PermissionsCookie;
        return permissions.carriers?.[relation];
    } catch (error) {
        console.error('checkPermissionsCookieForCarrierList::An error occurred while checking permissions cookie', error);
        return undefined;
    }
};
