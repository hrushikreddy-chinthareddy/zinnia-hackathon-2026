import { useUser } from '@auth0/nextjs-auth0/client';
import {
    BulkCheckTuple,
    checkIfUserHasCaseInsightsAccess,
    checkIfUserHasDashboardAccess,
    checkIfUserIsSuperAdmin,
    FgaRoles,
} from '@zinnia/utils';
import { getCookie, setCookie } from 'cookies-next';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { AE_FGA_ROLE } from '@deps/constants/advisors-excel';
import { PermissionsModel, UserPermission } from '@deps/models/user-profile';
import { checkTuple, getCarrierList, bulkCheckResponseClient } from '@deps/queries/api/fga';
import { AUDIENCE } from '@deps/queries/api-config';
import { FgaRelation } from '@deps/types/fga';
import { DEFAULT_PERMISSIONS_COOKIE, HasPermission, PERMISSIONS_COOKIE_NAME, PermissionsCookie } from '@deps/types/permissionsCookie';

export interface PermissionsContextProps {
    permissions: PermissionsModel;
    getSessionId: () => string;
    getUserPartyId: () => string;
    getIsAdvisorsExcel: () => Promise<boolean>;
    getClientIds: (permission: UserPermission) => Promise<string[]>;
    doesUserHavePagePermission: (permission: UserPermission) => Promise<boolean>;
    doesUserHaveDashboardPermission: () => Promise<boolean>;
    canEditPolicy: (
        permission: UserPermission,
        planCode: string | string[] | undefined,
        policyNumber: string | undefined
    ) => Promise<boolean>;
    fgaRoles: BulkCheckTuple[];
    isSuperAdmin: boolean;
    hasDashboardPermission: boolean;
    hasCaseInsightPermission: boolean;
    hasPermission: HasPermission;
    getCarriersList: (permission: UserPermission) => Promise<string[]>;
}

export const PermissionContext = createContext<PermissionsContextProps>({} as PermissionsContextProps);

export const usePermissionsContext = () => {
    return useContext(PermissionContext);
};

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
    const permissionsKey = AUDIENCE + '/permissions';

    const { user } = useUser();
    const partyId = user?.partyId as string;
    const sessionId = user?.sid as string;
    const [fgaRoles, setFgaRoles] = useState<BulkCheckTuple[]>([]);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [hasDashboardPermission, setHasDashboardPermission] = useState(false);
    const [hasCaseInsightPermission, setHasCaseInsightPermission] = useState(false);

    const addTupleToCookie = (relation: string, tupleObject: string, result: boolean) => {
        const permissionsCookie = getCookie(PERMISSIONS_COOKIE_NAME) ?? DEFAULT_PERMISSIONS_COOKIE;
        const permissions = JSON.parse(permissionsCookie) as PermissionsCookie;
        if (!permissions.tuples?.[relation]) {
            permissions.tuples[relation] = {};
        }
        permissions.tuples[relation][tupleObject] = result;
        setCookie(PERMISSIONS_COOKIE_NAME, JSON.stringify(permissions));
    };

    const addCarrierListToCookie = (relation: string, carrierList: string[]) => {
        const permissionsCookie = getCookie(PERMISSIONS_COOKIE_NAME) ?? DEFAULT_PERMISSIONS_COOKIE;
        const permissions = JSON.parse(permissionsCookie) as PermissionsCookie;
        permissions.carriers[relation] = carrierList;
        setCookie(PERMISSIONS_COOKIE_NAME, JSON.stringify(permissions));
    };

    const checkPermissionsCookieForCarrier = (relation: string, tupleObject: string, carrier: string): boolean => {
        try {
            if (!relation || !tupleObject || !carrier) {
                throw new Error('Missing carrier, relation or tupleObject');
            }

            const permissionsCookie = getCookie(PERMISSIONS_COOKIE_NAME);
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

    const checkPermissionsCookieForTuple = (relation: string, tupleObject: string): boolean | undefined => {
        try {
            if (!relation || !tupleObject) {
                throw new Error('Missing relation or tupleObject');
            }

            const permissionsCookie = getCookie(PERMISSIONS_COOKIE_NAME);
            if (!permissionsCookie) {
                return false;
            }

            const permissions = JSON.parse(permissionsCookie) as PermissionsCookie;
            return permissions.tuples?.[relation]?.[tupleObject];
        } catch (error) {
            console.error('checkPermissionsCookieForTuple::An error occurred while checking permissions cookie', error);
            return undefined;
        }
    };

    const checkPermissionsCookieForCarrierList = (relation: string): string[] | undefined => {
        try {
            if (!relation) {
                throw new Error('Missing relation');
            }

            const permissionsCookie = getCookie(PERMISSIONS_COOKIE_NAME);
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

    const hasPermission = async (relation: string, tupleObject: string, carrier?: string): Promise<boolean> => {
        // check if the user has the relation at the carrier level
        // if it doesn't exist OR is false at the carrier level, we need to do a tuple check before returning false
        if (carrier && checkPermissionsCookieForCarrier(relation, tupleObject, carrier)) {
            return true;
        }

        const tupleValue = checkPermissionsCookieForTuple(relation, tupleObject);

        // return the tuple check if it exists, otherwise we need to make a request
        if (tupleValue !== undefined) {
            return tupleValue;
        }

        const result = await checkTuple(partyId, relation, tupleObject);
        addTupleToCookie(relation, tupleObject, result);
        return result;
    };

    const getCarriersList = async (relation: string, policyNumber?: string, planCode?: string): Promise<string[]> => {
        const cookieCarrierList = checkPermissionsCookieForCarrierList(relation);
        if (cookieCarrierList !== undefined) {
            return cookieCarrierList;
        }
        const result = await getCarrierList(partyId, relation as UserPermission);

        addCarrierListToCookie(relation, result);
        return result || [];
    };

    useEffect(() => {
        const getRoles = async () => {
            try {
                if (!partyId) return;
                const roles = await bulkCheckResponseClient(partyId);
                const tuples = roles?.tuples ?? [];
                tuples.forEach(tuple => {
                    addTupleToCookie(tuple.relation, tuple.object, tuple.allowed);
                });

                setFgaRoles(tuples);
                const superAdmin = checkIfUserIsSuperAdmin(tuples);
                const hasDashboard = checkIfUserHasDashboardAccess(tuples);
                const hasCaseInsight = checkIfUserHasCaseInsightsAccess(tuples);
                setIsSuperAdmin(!!superAdmin);
                setHasDashboardPermission(!!hasDashboard);
                setHasCaseInsightPermission(!!hasCaseInsight);
            } catch (error: any) {
                console.error('getRoles::An error occurred while checking tuples', {
                    file: 'contexts/permissions-context',
                    function: 'getRoles',
                });
            }
        };

        getRoles();
    }, [partyId]);

    const getIsAdvisorsExcel = async (): Promise<boolean> => {
        if (!partyId) return false;

        try {
            const isAdvisorsExcel = await hasPermission(FgaRelation.Party, AE_FGA_ROLE);

            return isAdvisorsExcel;
        } catch (error: any) {
            console.error('getIsAdvisorsExcel::An error occurred while checking tuple', {
                partyId,
            });
        }

        return false;
    };
    const doesUserHaveDashboardPermission = async (): Promise<boolean> => {
        if (!partyId) {
            return false;
        }

        try {
            const hasPermissions = await hasPermission(FgaRelation.UiAccess, FgaRoles.CASE_STATS_DASHBOARD_ENTITY);

            return hasPermissions;
        } catch (error: any) {
            console.error('doesUserHaveDashboardPermission::An error occurred while checking tuple', {
                partyId,
            });
        }

        return false;
    };

    const getSessionId = (): string => {
        return sessionId;
    };

    const getUserPartyId = (): string => {
        return partyId;
    };

    const getPermissionSet = (): PermissionsModel => {
        if (!user || !user[permissionsKey]) return {} as PermissionsModel;

        const permissions: PermissionsModel = user[permissionsKey] as PermissionsModel;
        return permissions;
    };

    const getClientIds = async (permission: UserPermission): Promise<string[]> => {
        if (!partyId || !permission) return [];

        return await getCarriersList(permission);
    };

    // Can "const { user } = useUser();" and const permissions... be safely hoisted to the top of the method and used in a closure?
    const doesUserHavePagePermission = async (permission: UserPermission): Promise<boolean> => {
        if (!partyId || !permission) return false;

        const carriers = await getCarriersList(permission);

        if (carriers.length > 0) {
            return true;
        }

        return false;
    };

    const canEditPolicy = async (
        permission: UserPermission,
        planCode: string | string[] | undefined,
        policyNumber: string | undefined
    ): Promise<boolean> => {
        if (!partyId || !permission || !planCode || !policyNumber) return false;

        return hasPermission(permission, `policy:${policyNumber}_${planCode}`);
    };

    const permissions = getPermissionSet();

    return (
        <PermissionContext.Provider
            value={{
                permissions, // BPB - clear this up
                getIsAdvisorsExcel,
                getClientIds,
                getSessionId,
                getUserPartyId,
                doesUserHavePagePermission,
                doesUserHaveDashboardPermission,
                canEditPolicy,
                isSuperAdmin,
                fgaRoles,
                hasDashboardPermission,
                hasCaseInsightPermission,
                hasPermission,
                getCarriersList,
            }}
        >
            {children}
        </PermissionContext.Provider>
    );
};
