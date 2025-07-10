import { useUser } from '@auth0/nextjs-auth0/client';
import { useQuery } from '@tanstack/react-query';
import { PartyReferenceDataModel } from '@xd/api-types/dist/generated-types/partyreference';
import {
    BulkCheckTuple,
    checkIfUserHasAdvisorsExcel,
    checkIfUserHasCaseInsightsAccess,
    checkIfUserHasDashboardAccess,
    checkIfUserHasPolicyIndexAccess,
    checkIfUserIsSuperAdmin,
    checkRelation,
    createBulkCheckBodyRequest,
    FgaRoles,
} from '@zinnia/utils';
import { createContext, ReactNode, useContext } from 'react';

import { UserPermission } from '@deps/models/user-profile';
import { checkTuple } from '@deps/queries/api/fga';
import { getPartyMetadataById } from '@deps/queries/api/parties';
import {
    bulkCheckPermissionsQuery,
    doesUserHavePagePermissionQuery,
} from '@deps/queries/tanstack/permissionsQueries/permissions-queries';
import { FIFTEEN_MINUTES_IN_MS } from '@deps/types/constants';
import { FgaRelation, FgaUiEntity } from '@deps/types/fga';
import {
    getMasterAgentNumber,
    isWellabeAgent,
} from '@deps/utils/agent-helpers';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { useOptimizely } from './OptimizelyContext';

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
    isCallLogAudioPermitted: boolean;
    showToppanMerrill: boolean;
    showCommissions: boolean;
    partyReferenceData?: PartyReferenceDataModel;
    permissionsLoadingComplete: boolean;
    hasHomeExperience: boolean;
    hasPolicyIndexPageAccess: boolean;
}

export const PermissionContext = createContext<PermissionsContextProps>(
    {} as PermissionsContextProps
);

export const usePermissionsContext = () => {
    return useContext(PermissionContext);
};

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useUser();
    const { featureFlags } = useOptimizely();
    const partyId = user?.partyId as string;
    const sessionId = user?.sid as string;

    const { data: homeCheck, isLoading: homeCheckLoading } = useQuery({
        queryKey: ['isAllowHomeExperience', partyId],
        queryFn: () => {
            return checkTuple(
                partyId,
                FgaRelation.UiAccess,
                FgaUiEntity.ZinniaLiveHomeExerience
            );
        },
        enabled: !!partyId,
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });

    const {
        data: isAllowReadCaseManagement,
        isLoading: caseManagementLoading,
    } = useQuery({
        queryKey: [
            'isAllowReadCaseManagement',
            partyId,
            featureFlags[FEATURE_FLAGS.ENTERPRISE_SEARCH_CASE],
        ],
        queryFn: async () => {
            if (featureFlags[FEATURE_FLAGS.ENTERPRISE_SEARCH_CASE]) {
                return await checkTuple(
                    partyId,
                    FgaRelation.UiAccess,
                    FgaRoles.CASE_MANAGEMENT_ZL_ENTITY
                );
            }
            return await doesUserHavePagePermissionQuery(
                UserPermission.AllowReadCaseManagement,
                partyId
            );
        },
        enabled: !!partyId,
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });

    const { data: isAllowReadPolicyAdmin, isLoading: policyAdminLoading } =
        useQuery({
            queryKey: [
                'isAllowReadPolicyAdmin',
                partyId,
                featureFlags[FEATURE_FLAGS.ENTERPRISE_SEARCH_POLICY],
            ],
            queryFn: async () => {
                if (featureFlags[FEATURE_FLAGS.ENTERPRISE_SEARCH_POLICY]) {
                    return await checkTuple(
                        partyId,
                        FgaRelation.UiAccess,
                        FgaRoles.POLICY_MANAGEMENT_ZL_ENTITY
                    );
                }
                return await doesUserHavePagePermissionQuery(
                    UserPermission.AllowReadPolicyAdmin,
                    partyId
                );
            },
            enabled: !!partyId,
            staleTime: FIFTEEN_MINUTES_IN_MS,
        });

    const { data: isAllowReadOtpRenewals, isLoading: otpRenewalsLoading } =
        useQuery({
            queryKey: ['isAllowReadOtpRenewals', partyId],
            queryFn: () => {
                return doesUserHavePagePermissionQuery(
                    UserPermission.AllowReadOtpRenewals,
                    partyId
                );
            },
            enabled: !!partyId,
            staleTime: FIFTEEN_MINUTES_IN_MS,
        });

    const { data: partyReferenceData, isLoading: showToppanMerrillLoading } =
        useQuery({
            queryKey: ['partyReferenceMetaData', partyId],
            queryFn: () => getPartyMetadataById(partyId),
            enabled: !!partyId,
            select: (response) => {
                const partyRefData = response?.data as PartyReferenceDataModel;
                return partyRefData;
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
            const data = await bulkCheckPermissionsQuery(
                createBulkCheckBodyRequest(partyId)
            );

            const superAdmin = checkIfUserIsSuperAdmin(data);
            const hasDashboard = checkIfUserHasDashboardAccess(data);
            const hasCaseInsight = checkIfUserHasCaseInsightsAccess(data);
            const hasAdvisorsExcel = checkIfUserHasAdvisorsExcel(data);
            const hasPolicyIndexPageAccess =
                checkIfUserHasPolicyIndexAccess(data);
            const isCallLogAudioPermitted = !!checkRelation(
                data,
                FgaRoles.CALL_LOG_ACCESS,
                FgaRelation.UiAccess
            );
            return {
                fgaRoles: data,
                isSuperAdmin: !!superAdmin,
                hasDashboardPermission: !!hasDashboard,
                hasCaseInsightPermission: !!hasCaseInsight,
                isAdvisorsExcel: !!hasAdvisorsExcel,
                isCallLogAudioPermitted,
                hasPolicyIndexPageAccess: !!hasPolicyIndexPageAccess,
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
                hasCaseInsightPermission:
                    !!fgaRoleData?.hasCaseInsightPermission,
                isAllowReadCaseManagement: !!isAllowReadCaseManagement,
                isAllowReadPolicyAdmin: !!isAllowReadPolicyAdmin,
                isAllowReadOtpRenewals: !!isAllowReadOtpRenewals,
                isCallLogAudioPermitted: !!fgaRoleData?.isCallLogAudioPermitted,
                hasHomeExperience: !!homeCheck?.data,
                showToppanMerrill: partyReferenceData
                    ? !!isWellabeAgent(partyReferenceData)
                    : false,
                showCommissions: partyReferenceData
                    ? !!getMasterAgentNumber(partyReferenceData)
                    : false,
                partyReferenceData,
                permissionsLoadingComplete,
                hasPolicyIndexPageAccess:
                    !!fgaRoleData?.hasPolicyIndexPageAccess,
            }}
        >
            {children}
        </PermissionContext.Provider>
    );
};
