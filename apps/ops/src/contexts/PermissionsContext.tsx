import { useUser } from '@auth0/nextjs-auth0/client';
import {
    BulkCheckTuple,
    checkIfUserHasAdvisorsExcel,
    checkIfUserHasCaseInsightsAccess,
    checkIfUserHasDashboardAccess,
    checkIfUserIsSuperAdmin,
    createBulkCheckBodyRequest,
    FGA_Tuple,
    FgaRoles,
} from '@zinnia/utils';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { UserPermission } from '@deps/models/user-profile';
import { checkTuple, getCarrierList, bulkCheckResponseClient } from '@deps/queries/api/fga';
import { FgaRelation } from '@deps/types/fga';
import { HasPermission } from '@deps/types/permissionsCookie';
import {
    addCarrierListToCookie,
    addTupleToCookie,
    doesPermissionsHaveCarrierRelation,
    checkPermissionsCookieForCarrierList,
    checkPermissionsCookieForTuple,
} from '@deps/utils/permissionsCookie';

export interface PermissionsContextProps {
    getSessionId: () => string;
    getUserPartyId: () => string;
    getClientIds: (permission: UserPermission) => Promise<string[]>;
    doesUserHavePagePermission: (permission: UserPermission) => Promise<boolean>;
    doesUserHaveDashboardPermission: () => Promise<boolean>;
    canEditPolicy: (
        permission: UserPermission,
        planCode: string | string[] | undefined,
        policyNumber: string | undefined
    ) => Promise<boolean>;
    bulkCheckComplete: boolean;
    fgaRoles: BulkCheckTuple[];
    isAdvisorsExcel: boolean;
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
    const { user } = useUser();
    const partyId = user?.partyId as string;
    const sessionId = user?.sid as string;
    const [fgaRoles, setFgaRoles] = useState<BulkCheckTuple[]>([]);
    const [bulkCheckComplete, setBulkCheckComplete] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isAdvisorsExcel, setIsAdvisorsExcel] = useState(false);
    const [hasDashboardPermission, setHasDashboardPermission] = useState(false);
    const [hasCaseInsightPermission, setHasCaseInsightPermission] = useState(false);

    // restrict fga tuple checks to tuples that don't already exist in the cookie
    const hasPermission = async (relation: string, tupleObject: string, carrier?: string): Promise<boolean> => {
        // check if the user has the relation at the carrier level
        // if it doesn't exist OR is false at the carrier level, we need to do a tuple check before returning false
        if (carrier && doesPermissionsHaveCarrierRelation(relation, carrier)) {
            return true;
        }

        const tupleValue = checkPermissionsCookieForTuple(relation, tupleObject);

        // return the tuple check if it exists, otherwise we need to make a request
        if (tupleValue !== undefined) {
            return tupleValue;
        }

        const result = await checkTuple(partyId, relation, tupleObject);
        // only store the tuple if the request was successful
        if (!result.error) {
            addTupleToCookie(relation, tupleObject, !!result.data);
        }
        return !!result.data;
    };

    // restrict bulk checks to tuples that don't already exist in the cookie
    const bulkCheckPermissions = async ({ tuples }: { tuples: FGA_Tuple[] }): Promise<BulkCheckTuple[]> => {
        const checkedTuples = tuples.map(tuple => {
            return { ...tuple, allowed: checkPermissionsCookieForTuple(tuple.relation, tuple.object) };
        });
        const neededTuples = checkedTuples.filter(tuple => tuple.allowed === undefined);
        if (neededTuples.length) {
            const result = await bulkCheckResponseClient({ tuples: neededTuples });
            result?.data?.tuples?.forEach(tuple => {
                // only store the tuple if the request was successful
                if (!result.error) {
                    addTupleToCookie(tuple.relation, tuple.object, tuple.allowed);
                }
                const index = checkedTuples.findIndex(t => t.relation === tuple.relation && t.object === tuple.object);
                if (index !== -1) {
                    checkedTuples[index].allowed = tuple.allowed;
                }
            });
        }

        return checkedTuples.map(tuple => ({ ...tuple, allowed: !!tuple.allowed }));
    };

    const getCarriersList = async (relation: string): Promise<string[]> => {
        const cookieCarrierList = checkPermissionsCookieForCarrierList(relation);
        if (cookieCarrierList !== undefined) {
            return cookieCarrierList;
        }
        const result = await getCarrierList(partyId, relation as UserPermission);

        // only add to cookie if the request was successful
        if (!result.error) {
            addCarrierListToCookie(relation, result.data ?? []);
        }
        return result.data ?? [];
    };

    useEffect(() => {
        const getRoles = async () => {
            try {
                if (!partyId) {
                    return;
                }

                const tuples = await bulkCheckPermissions(createBulkCheckBodyRequest(partyId));
                setFgaRoles(tuples);
                const superAdmin = checkIfUserIsSuperAdmin(tuples);
                const hasDashboard = checkIfUserHasDashboardAccess(tuples);
                const hasCaseInsight = checkIfUserHasCaseInsightsAccess(tuples);
                const hasAdvisorsExcel = checkIfUserHasAdvisorsExcel(tuples);

                setIsSuperAdmin(!!superAdmin);
                setHasDashboardPermission(!!hasDashboard);
                setHasCaseInsightPermission(!!hasCaseInsight);
                setIsAdvisorsExcel(!!hasAdvisorsExcel);
                setBulkCheckComplete(true);
            } catch (error: any) {
                console.error('getRoles::An error occurred while checking tuples', {
                    file: 'contexts/permissions-context',
                    function: 'getRoles',
                });
            }
        };

        getRoles();
    }, [partyId]);

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

    const getClientIds = async (permission: UserPermission): Promise<string[]> => {
        if (!partyId || !permission) return [];

        return await getCarriersList(permission);
    };

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

    return (
        <PermissionContext.Provider
            value={{
                bulkCheckComplete,
                getClientIds,
                getSessionId,
                getUserPartyId,
                doesUserHavePagePermission,
                doesUserHaveDashboardPermission,
                canEditPolicy,
                isAdvisorsExcel,
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
