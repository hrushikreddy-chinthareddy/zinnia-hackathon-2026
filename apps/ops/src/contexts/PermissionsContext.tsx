import { useUser } from '@auth0/nextjs-auth0/client';
import { useQuery } from '@tanstack/react-query';
import { PartyReferenceDataModel } from '@xd/api-types/dist/generated-types/partyreference';
import {
    BulkCheckTuple,
    checkIfUserHasAdvisorsExcel,
    checkIfUserHasCaseInsightsAccess,
    checkIfUserHasDashboardAccess,
    checkIfUserIsSuperAdmin,
    createBulkCheckBodyRequest,
} from '@zinnia/utils';
import { createContext, ReactNode, useContext } from 'react';

import { UserPermission } from '@deps/models/user-profile';
import { checkTuple } from '@deps/queries/api/fga';
import { getPartyMetadataById } from '@deps/queries/api/parties';
import { bulkCheckPermissionsQuery, doesUserHavePagePermissionQuery } from '@deps/queries/tanstack/permissionsQueries/permissions-queries';
import { FIFTEEN_MINUTES_IN_MS } from '@deps/types/constants';
import { FgaRelation, FgaUiEntity } from '@deps/types/fga';
import { isWellabeAgent } from '@deps/utils/agent-helper';

export interface PermissionsContextProps {
    sessionId: string;
    partyId: string;
    bulkCheckComplete: boolean;
    fgaRolesData: BulkCheckTuple[];
    isAdvisorsExcel: boolean;
    isSuperAdmin: boolean;
    hasDashboardPermission: boolean;
    hasCaseInsightPermission: boolean;
    isAllowReadCaseManagement: boolean;
    isAllowReadPolicyAdmin: boolean;
    isAllowReadOtpRenewals: boolean;
    showToppanMerrill: boolean;
    permissionsLoadingComplete: boolean;
    hasHomeExperience: boolean;
}

export const PermissionContext = createContext<PermissionsContextProps>({} as PermissionsContextProps);

export const usePermissionsContext = () => {
    return useContext(PermissionContext);
};

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useUser();
    const partyId = user?.partyId as string;
    const sessionId = user?.sid as string;

    const { data: homeCheck, isLoading: homeCheckLoading } = useQuery({
        queryKey: ['isAllowHomeExperience', partyId],
        queryFn: () => {
            return checkTuple(partyId, FgaRelation.UiAccess, FgaUiEntity.ZinniaLiveHomeExerience);
        },
        enabled: !!partyId,
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });

    const { data: isAllowReadCaseManagement, isLoading: caseManagementLoading } = useQuery({
        queryKey: ['isAllowReadCaseManagement', partyId],
        queryFn: () => {
            return doesUserHavePagePermissionQuery(UserPermission.AllowReadCaseManagement, partyId);
        },
        enabled: !!partyId,
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });

    const { data: isAllowReadPolicyAdmin, isLoading: policyAdminLoading } = useQuery({
        queryKey: ['isAllowReadPolicyAdmin', partyId],
        queryFn: () => {
            return doesUserHavePagePermissionQuery(UserPermission.AllowReadPolicyAdmin, partyId);
        },
        enabled: !!partyId,
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });

    const { data: isAllowReadOtpRenewals, isLoading: otpRenewalsLoading } = useQuery({
        queryKey: ['isAllowReadOtpRenewals', partyId],
        queryFn: () => {
            return doesUserHavePagePermissionQuery(UserPermission.AllowReadOtpRenewals, partyId);
        },
        enabled: !!partyId,
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });

    const { data: showToppanMerrill, isLoading: showToppanMerrillLoading } = useQuery({
        queryKey: ['partyReferenceMetaData', partyId],
        queryFn: () => getPartyMetadataById(partyId),
        enabled: !!partyId,
        select: (response: any) => {
            const partyRefData = response?.data as PartyReferenceDataModel;
            return isWellabeAgent(partyRefData);
        },
    });

    const {
        data: fgaRoleData,
        isLoading: bulkCheckLoading,
        isFetching: _rolesFetching,
        isError: _rolesError,
    } = useQuery({
        queryKey: ['fgaRoles', partyId],
        queryFn: async () => {
            const data = await bulkCheckPermissionsQuery(createBulkCheckBodyRequest(partyId));

            const superAdmin = checkIfUserIsSuperAdmin(data);
            const hasDashboard = checkIfUserHasDashboardAccess(data);
            const hasCaseInsight = checkIfUserHasCaseInsightsAccess(data);
            const hasAdvisorsExcel = checkIfUserHasAdvisorsExcel(data);

            return {
                fgaRoles: data,
                isSuperAdmin: !!superAdmin,
                hasDashboardPermission: !!hasDashboard,
                hasCaseInsightPermission: !!hasCaseInsight,
                isAdvisorsExcel: !!hasAdvisorsExcel,
            };
        },
        enabled: !!partyId,
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });

    const permissionsLoadingComplete =
        !bulkCheckLoading &&
        !caseManagementLoading &&
        !policyAdminLoading &&
        !otpRenewalsLoading &&
        !showToppanMerrillLoading &&
        !homeCheckLoading;
    return (
        <PermissionContext.Provider
            value={{
                bulkCheckComplete: !bulkCheckLoading,
                sessionId,
                partyId,
                isAdvisorsExcel: !!fgaRoleData?.isAdvisorsExcel,
                isSuperAdmin: !!fgaRoleData?.isSuperAdmin,
                fgaRolesData: fgaRoleData?.fgaRoles || [],
                hasDashboardPermission: !!fgaRoleData?.hasDashboardPermission,
                hasCaseInsightPermission: !!fgaRoleData?.hasCaseInsightPermission,
                isAllowReadCaseManagement: !!isAllowReadCaseManagement,
                isAllowReadPolicyAdmin: !!isAllowReadPolicyAdmin,
                isAllowReadOtpRenewals: !!isAllowReadOtpRenewals,
                hasHomeExperience: !!homeCheck?.data,
                showToppanMerrill: !!showToppanMerrill,
                permissionsLoadingComplete,
            }}
        >
            {children}
        </PermissionContext.Provider>
    );
};
