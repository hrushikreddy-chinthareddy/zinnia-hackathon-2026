import { useUser } from '@auth0/nextjs-auth0/client';
import {
    BulkCheckTuple,
    checkIfUserHasCaseInsightsAccess,
    checkIfUserHasDashboardAccess,
    checkIfUserIsSuperAdmin,
    FgaRoles,
} from '@zinnia/utils';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { AE_FGA_ROLE } from '@deps/constants/advisors-excel';
import { PermissionsModel, UserPermission } from '@deps/models/user-profile';
import { checkTuple, getCarrierList, bulkCheckResponseClient } from '@deps/queries/api/fga';
import { AUDIENCE } from '@deps/queries/api-config';
import { FgaRelation } from '@deps/types/fga';

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

    useEffect(() => {
        const getRoles = async () => {
            try {
                if (!partyId) return;
                const roles = await bulkCheckResponseClient(partyId);
                if (!roles) return;

                setFgaRoles(roles.tuples);
                const superAdmin = checkIfUserIsSuperAdmin(roles?.tuples);
                const hasDashboard = checkIfUserHasDashboardAccess(roles?.tuples);
                const hasCaseInsight = checkIfUserHasCaseInsightsAccess(roles?.tuples);
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
            const isAdvisorsExcel = await checkTuple(partyId, FgaRelation.Party, AE_FGA_ROLE);

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
            const hasPermissions = await checkTuple(partyId, FgaRelation.UiAccess, FgaRoles.CASE_STATS_DASHBOARD_ENTITY);

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

        return await getCarrierList(partyId, permission);
    };

    // Can "const { user } = useUser();" and const permissions... be safely hoisted to the top of the method and used in a closure?
    const doesUserHavePagePermission = async (permission: UserPermission): Promise<boolean> => {
        if (!partyId || !permission) return false;

        const carriers = await getCarrierList(partyId, permission);

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

        const carriers = await getCarrierList(partyId, permission, planCode, policyNumber);

        if (carriers.length > 0) {
            return true;
        }

        return false;
    };

    const permissions = getPermissionSet();

    return (
        <PermissionContext.Provider
            value={{
                permissions,
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
            }}
        >
            {children}
        </PermissionContext.Provider>
    );
};
