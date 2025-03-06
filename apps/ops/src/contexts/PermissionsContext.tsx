import { useUser } from '@auth0/nextjs-auth0/client';
import {
    BulkCheckTuple,
    checkIfUserHasCaseInsightsAccess,
    checkIfUserHasDashboardAccess,
    checkIfUserIsSuperAdmin,
    createBulkCheckBodyRequest,
    FGA_Tuple,
    FgaRoles,
} from '@zinnia/utils';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { AE_FGA_ROLE } from '@deps/constants/advisors-excel';
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
    const { user } = useUser();
    const partyId = user?.partyId as string;
    const sessionId = user?.sid as string;
    const [fgaRoles, setFgaRoles] = useState<BulkCheckTuple[]>([]);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
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
        addTupleToCookie(relation, tupleObject, result);
        return result;
    };

    // restrict bulk checks to tuples that don't already exist in the cookie
    const bulkCheckPermissions = async ({ tuples }: { tuples: FGA_Tuple[] }): Promise<BulkCheckTuple[]> => {
        const checkedTuples = tuples.map(tuple => {
            return { ...tuple, allowed: checkPermissionsCookieForTuple(tuple.relation, tuple.object) };
        });
        const neededTuples = checkedTuples.filter(tuple => tuple.allowed === undefined);
        if (neededTuples.length) {
            const result = await bulkCheckResponseClient({ tuples: neededTuples });
            result?.tuples?.forEach(tuple => {
                addTupleToCookie(tuple.relation, tuple.object, tuple.allowed);
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

        addCarrierListToCookie(relation, result);
        return result || [];
    };

    useEffect(() => {
        const getRoles = async () => {
            try {
                if (!partyId) return;
                const tuples = await bulkCheckPermissions(createBulkCheckBodyRequest(partyId));
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

    return (
        <PermissionContext.Provider
            value={{
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
