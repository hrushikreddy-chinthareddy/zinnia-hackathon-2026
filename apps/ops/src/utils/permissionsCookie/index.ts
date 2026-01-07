import { getCookie, setCookie } from 'cookies-next';

import {
    DEFAULT_PERMISSIONS_COOKIE,
    PERMISSIONS_COOKIE_NAME,
    PermissionsCookie,
    ROLES_COOKIE_NAME,
} from '@deps/types/permissionsCookie';

import { isHttpsEnvironment } from '../environment.helpers';
import { logWarn } from '../server-logging';

const permissionsCookieOptions = {
    maxAge: 60 * 5, // 5 mins
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: isHttpsEnvironment(),
};

const rolesCookieOptions = {
    maxAge: 60 * 60 * 1, // 1 hour
    path: '/',
    sameSite: 'lax',
    httpOnly: false, // roles need to be exposed to the client scripts
    secure: isHttpsEnvironment(),
};

export const addTupleToCookie = (
    relation: string,
    tupleObject: string,
    result: boolean,
    req?: any,
    res?: any
) => {
    try {
        const permissionsCookie =
            getCookie(PERMISSIONS_COOKIE_NAME, { req, res }) ??
            DEFAULT_PERMISSIONS_COOKIE;
        const permissions = JSON.parse(permissionsCookie) as PermissionsCookie;
        if (!permissions.tuples?.[relation]) {
            permissions.tuples[relation] = {};
        }
        permissions.tuples[relation][tupleObject] = result;
        setCookie(PERMISSIONS_COOKIE_NAME, JSON.stringify(permissions), {
            req,
            res,
            ...permissionsCookieOptions,
        });
    } catch (error) {
        logWarn(
            'addTupleToCookie::An error occurred while adding tuple to cookie'
        );
    }
};

export const addCarrierListToCookie = (
    relation: string,
    carrierList: string[],
    req?: any,
    res?: any
) => {
    try {
        const permissionsCookie =
            getCookie(PERMISSIONS_COOKIE_NAME, { req, res }) ??
            DEFAULT_PERMISSIONS_COOKIE;
        const permissions = JSON.parse(permissionsCookie) as PermissionsCookie;
        permissions.carriers[relation] = carrierList;
        setCookie(PERMISSIONS_COOKIE_NAME, JSON.stringify(permissions), {
            req,
            res,
            ...permissionsCookieOptions,
        });
    } catch (error) {
        logWarn(
            'addCarrierListToCookie::An error occurred while adding carrier list to cookie'
        );
    }
};

export const doesPermissionsHaveCarrierRelation = (
    relation: string,
    carrier: string,
    req?: any,
    res?: any
): boolean => {
    try {
        if (!relation || !carrier) {
            throw new Error('Missing carrier or relation');
        }

        const permissionsCookie = getCookie(PERMISSIONS_COOKIE_NAME, {
            req,
            res,
        });
        if (!permissionsCookie) {
            return false;
        }

        const permissions = JSON.parse(permissionsCookie) as PermissionsCookie;
        return !!permissions.carriers?.[relation]?.includes(carrier);
    } catch (error) {
        logWarn(
            `checkPermissionsCookieForCarrier::An error occurred while checking permissions cookie: ${error}`
        );
        return false;
    }
};

export const checkPermissionsCookieForTuple = (
    relation: string,
    tupleObject: string,
    req?: any,
    res?: any
): boolean | undefined => {
    try {
        if (!relation || !tupleObject) {
            throw new Error('Missing relation or tupleObject');
        }

        const permissionsCookie = getCookie(PERMISSIONS_COOKIE_NAME, {
            req,
            res,
        });

        if (!permissionsCookie) {
            return undefined;
        }

        const permissions = JSON.parse(permissionsCookie) as PermissionsCookie;
        return permissions.tuples?.[relation]?.[tupleObject];
    } catch (error) {
        logWarn(
            `checkPermissionsCookieForTuple::An error occurred while checking permissions cookie: ${error}`
        );
        return undefined;
    }
};

// check if the permissions object has the carrier list for the relation provided
export const checkPermissionsCookieForCarrierList = (
    relation: string,
    req?: any,
    res?: any
): string[] | undefined => {
    try {
        if (!relation) {
            throw new Error('Missing relation');
        }

        const permissionsCookie = getCookie(PERMISSIONS_COOKIE_NAME, {
            req,
            res,
        });
        if (!permissionsCookie) {
            return undefined;
        }

        const permissions = JSON.parse(permissionsCookie) as PermissionsCookie;
        return permissions.carriers?.[relation];
    } catch (error) {
        logWarn(
            `checkPermissionsCookieForCarrierList::An error occurred while checking permissions cookie: ${error}`
        );
        return undefined;
    }
};

// Cookie age controlled by permissionsCookieOptions
export const setRolesCookie = (
    roles: Record<string, string[]>,
    req?: any, // FIXME: constrict type
    res?: any
) => {
    try {
        setCookie(ROLES_COOKIE_NAME, JSON.stringify(roles), {
            req,
            res,
            ...rolesCookieOptions,
        });
    } catch (error) {
        logWarn(
            `setRolesCookie::An error occurred while setting the roles cookie: ${error}`
        );
    }
};

export const getRolesFromCookie = (
    req?: any,
    res?: any
): Record<string, string[]> | undefined => {
    try {
        const rolesCookie = getCookie(ROLES_COOKIE_NAME, {
            req,
            res,
        });
        if (!rolesCookie) {
            return undefined;
        }

        const roles = JSON.parse(rolesCookie);
        return roles;
    } catch (error) {
        logWarn(
            `getRolesCookie::An error occurred while getting roles cookie: ${error}`
        );
        return undefined;
    }
};
