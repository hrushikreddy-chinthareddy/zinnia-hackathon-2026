import { useUser } from '@auth0/nextjs-auth0/client';
import { useQuery } from '@tanstack/react-query';
import { createContext, ReactNode, useContext } from 'react';

import { UserPermission } from '@deps/models/user-profile';
import { checkTuple } from '@deps/queries/api/fga';
import { getPartyMetadataById } from '@deps/queries/api/parties';
import {
    bulkCheckPermissionsQuery,
    doesUserHavePagePermissionQuery,
    getCarriersListQuery,
} from '@deps/queries/tanstack/permissionsQueries/permissions-queries';
import { FIFTEEN_MINUTES_IN_MS } from '@deps/types/constants';
import { FgaRelation, FgaUiEntity } from '@deps/types/fga';
import { getMasterAgentNumber } from '@deps/utils/agent-helpers';
import {
    BulkCheckTuple,
    checkIfUserHasAdvisorsExcel,
    checkIfUserHasCaseInsightsAccess,
    checkIfUserHasDashboardAccess,
    checkIfUserHasPolicyIndexAccess,
    checkIfUserHasUsageAccess,
    checkIfUserIsSuperAdmin,
    checkRelation,
    createBulkCheckBodyRequest,
    FgaRoles,
} from '@deps/utils/auth';
import { isDemo } from '@deps/utils/environment.helpers';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { PartyReferenceDataModel } from '@zinnia/api-types/types/partyreference';

import { useOptimizely } from './OptimizelyContext';

export interface PermissionsContextProps {
    sessionId: string;
    partyId: string;
    writeClientCaseCarriers: string[];
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
    showWelbSalesMaterials: boolean;
    showCommissions: boolean;
    partyReferenceData?: PartyReferenceDataModel;
    permissionsLoadingComplete: boolean;
    hasHomeExperience: boolean;
    isOpsManagerView: boolean;
    hasPolicyIndexPageAccess: boolean;
    isAllowReadIllustrations: boolean;
    hasEditServiceRequestAccess?: boolean;
    hasUsagePermission: boolean;
    hasAiAssistantPermissions: boolean;
    hasCallLogsAccess: boolean;
    hasNotesAccess: boolean;
    hasTestHarnessAccess: boolean;
    isZinniaInternalViewer: boolean;
    isZinniaInternalProcessor: boolean;
    isAllowWriteClientCase: boolean;
    isAllowOpsCaseReviewRequest: boolean;
    hasPermissionToPrioritizeCases: boolean;
    hasMarketConnectContacts: boolean;
    isSuperIllustrator: boolean;
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

    const hasMarketConnectContacts =
        !!featureFlags[FEATURE_FLAGS.MARKET_CONNECT_ENABLED];

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

    const { data: opsManagerCheck, isLoading: opsManagerLoading } = useQuery({
        queryKey: ['isAllowOpsManagerView', partyId],
        queryFn: () => {
            return checkTuple(
                partyId,
                FgaRelation.UiAccess,
                FgaUiEntity.ZinniaLiveTaskManagment
            );
        },
        enabled: !!partyId,
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });
    // IMH-87188-87186 (186 is the IMH you can view in JIRA)
    const isCaseManagementFgaEnabled =
        featureFlags[FEATURE_FLAGS.FGA_ENTITY_ZINNIA_LIVE_CASE_MANAGEMENT];
    const {
        data: isAllowReadCaseManagement,
        isLoading: caseManagementLoading,
    } = useQuery({
        queryKey: [
            'isAllowReadCaseManagement',
            partyId,
            featureFlags[FEATURE_FLAGS.ENTERPRISE_SEARCH_CASE],
            isCaseManagementFgaEnabled,
        ],
        queryFn: async () => {
            if (!isCaseManagementFgaEnabled) {
                return true;
            }
            if (featureFlags[FEATURE_FLAGS.ENTERPRISE_SEARCH_CASE]) {
                const res = await checkTuple(
                    partyId,
                    FgaRelation.UiAccess,
                    FgaRoles.CASE_MANAGEMENT_ZL_ENTITY
                );
                return !!res.data;
            }
            return await doesUserHavePagePermissionQuery(
                UserPermission.AllowReadCaseManagement,
                partyId
            );
        },
        enabled: !!partyId,
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });
    const isPolicyManagementFgaEnabled =
        featureFlags[FEATURE_FLAGS.FGA_ENTITY_ZINNIA_LIVE_POLICY_MANAGEMENT];
    const { data: isAllowReadPolicyAdmin, isLoading: policyAdminLoading } =
        useQuery({
            queryKey: [
                'isAllowReadPolicyAdmin',
                partyId,
                featureFlags[FEATURE_FLAGS.ENTERPRISE_SEARCH_POLICY],
                isPolicyManagementFgaEnabled,
            ],
            queryFn: async () => {
                if (!isPolicyManagementFgaEnabled) {
                    return true;
                }

                if (featureFlags[FEATURE_FLAGS.ENTERPRISE_SEARCH_POLICY]) {
                    const res = await checkTuple(
                        partyId,
                        FgaRelation.UiAccess,
                        FgaRoles.POLICY_MANAGEMENT_ZL_ENTITY
                    );
                    return !!res.data;
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

    const {
        data: isAllowOpsCaseReviewRequest,
        isLoading: opsCaseReviewRequestLoading,
    } = useQuery({
        queryKey: ['isAllowOpsCaseReviewRequest', partyId],
        queryFn: () => {
            return doesUserHavePagePermissionQuery(
                UserPermission.AllowOpsCaseReviewRequest,
                partyId
            );
        },
        enabled: !!partyId,
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });

    const {
        data: hasEditServiceRequestAccess,
        isLoading: hasServiceRequestLoading,
    } = useQuery({
        queryKey: ['isAllowServiceRequest', partyId],
        queryFn: async () => {
            return await checkTuple(
                partyId,
                FgaRelation.UiAccess,
                FgaUiEntity.ZinniaLiveServiceRequest
            );
        },
        enabled: !!partyId,
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });

    const { data: partyReferenceData, isLoading: partyRefLoading } = useQuery({
        queryKey: ['partyReferenceMetaData', partyId],
        queryFn: () => getPartyMetadataById(partyId),
        enabled: !!partyId,
        select: (response) => {
            const partyRefData = response?.data as PartyReferenceDataModel;
            return partyRefData;
        },
    });

    const { data: writeClientCaseCarriers } = useQuery({
        queryKey: ['writeClientCaseCarriers', partyId],
        queryFn: () =>
            getCarriersListQuery(UserPermission.AllowWriteClientCase, partyId),
        enabled: !!partyId,
        initialData: [],
        staleTime: FIFTEEN_MINUTES_IN_MS,
        initialDataUpdatedAt: Date.now() - FIFTEEN_MINUTES_IN_MS,
    });

    const isSuperIllustrator = !!writeClientCaseCarriers.length;

    const { data: writeCasePriority } = useQuery({
        queryKey: ['writeCasePriority', partyId],
        queryFn: () =>
            doesUserHavePagePermissionQuery(
                UserPermission.AllowWriteCasePriority,
                partyId
            ),
        enabled: !!partyId,
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });

    const {
        data: fgaRoleData,
        isLoading: bulkCheckLoading,
        isFetching: _rolesFetching,
        isError: _rolesError,
    } = useQuery({
        queryKey: [
            'fgaRoles',
            partyId,
            featureFlags[FEATURE_FLAGS.FGA_ENTITY_SALES_MATERIALS],
        ],
        queryFn: async () => {
            const tuples = [
                ...createBulkCheckBodyRequest(partyId).tuples,

                {
                    user: `party:${partyId}`,
                    relation: FgaRelation.Party,
                    object: FgaRoles.ZINNIA_INTERNAL_VIEWER,
                },
                {
                    // IMH-85894
                    user: `party:${partyId}`,
                    relation: FgaRelation.Party,
                    object: FgaRoles.ZINNIA_INTERNAL_PROCESSOR,
                },

                {
                    user: `party:${partyId}`,
                    relation: FgaRelation.UiAccess,
                    object: FgaRoles.ILLUSTRATIONS_CREATE_CLIENT_CASE_EXPERIENCE,
                },
            ];

            if (isDemo()) {
                tuples.push({
                    user: `party:${partyId}`,
                    relation: FgaRelation.UiAccess,
                    object: FgaRoles.TEST_HARNESS_ACCESS,
                });
            }

            if (featureFlags[FEATURE_FLAGS.FGA_ENTITY_SALES_MATERIALS]) {
                tuples.push({
                    user: `party:${partyId}`,
                    relation: FgaRelation.UiAccess,
                    object: FgaRoles.WELB_SALES_MATERIALS,
                });
            }

            const data = await bulkCheckPermissionsQuery({ tuples });
            const superAdmin = checkIfUserIsSuperAdmin(data);
            const hasDashboard = checkIfUserHasDashboardAccess(data);
            const hasCaseInsight = checkIfUserHasCaseInsightsAccess(data);
            const hasUsage = checkIfUserHasUsageAccess(data);
            const hasAdvisorsExcel = checkIfUserHasAdvisorsExcel(data);
            const hasPolicyIndexPageAccess =
                checkIfUserHasPolicyIndexAccess(data);
            const isCallLogAudioPermitted = !!checkRelation(
                data,
                FgaRoles.CALL_LOG_ACCESS,
                FgaRelation.UiAccess
            );
            const isAllowReadIllustrations = !!checkRelation(
                data,
                FgaRoles.ILLUSTRATIONS_EXPERIENCE,
                FgaRelation.UiAccess
            );
            const hasAiAssistantPermissions = !!checkRelation(
                data,
                FgaRoles.AIASSISTANT,
                FgaRelation.UiAccess
            );
            const hasCallLogsAccess = !!checkRelation(
                data,
                FgaRoles.CALL_LOGS_ZL,
                FgaRelation.UiAccess
            );
            const hasNotesAccess = !!checkRelation(
                data,
                FgaRoles.NOTES_ACCESS,
                FgaRelation.UiAccess
            );
            let hasTestHarnessAccess = false;
            if (isDemo()) {
                hasTestHarnessAccess = !!checkRelation(
                    data,
                    FgaRoles.TEST_HARNESS_ACCESS,
                    FgaRelation.UiAccess
                );
            }
            const isZinniaInternalViewer = !!checkRelation(
                data,
                FgaRoles.ZINNIA_INTERNAL_VIEWER,
                FgaRelation.Party
            );
            const isZinniaInternalProcessor = !!checkRelation(
                data,
                FgaRoles.ZINNIA_INTERNAL_PROCESSOR,
                FgaRelation.Party
            );
            let hasWelbSalesMaterials = false;
            if (featureFlags[FEATURE_FLAGS.FGA_ENTITY_SALES_MATERIALS]) {
                hasWelbSalesMaterials = !!checkRelation(
                    data,
                    FgaRoles.WELB_SALES_MATERIALS,
                    FgaRelation.UiAccess
                );
            }

            const hasCreateClientAccess = !!checkRelation(
                data,
                FgaRoles.ILLUSTRATIONS_CREATE_CLIENT_CASE_EXPERIENCE,
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
                isAllowReadIllustrations,
                hasUsagePermission: !!hasUsage,
                hasAiAssistantPermissions,
                hasCallLogsAccess,
                hasNotesAccess,
                hasTestHarnessAccess,
                isZinniaInternalViewer,
                isZinniaInternalProcessor,
                hasWelbSalesMaterials,
                hasCreateClientAccess,
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
        !hasServiceRequestLoading &&
        !partyRefLoading &&
        !homeCheckLoading &&
        !opsManagerLoading &&
        !opsCaseReviewRequestLoading;

    return (
        <PermissionContext.Provider
            value={{
                bulkCheckComplete: !bulkCheckLoading,
                sessionId,
                partyId,
                writeClientCaseCarriers,
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
                isOpsManagerView: !!opsManagerCheck?.data,
                showWelbSalesMaterials: !!fgaRoleData?.hasWelbSalesMaterials,
                showCommissions: partyReferenceData
                    ? !!getMasterAgentNumber(partyReferenceData)
                    : false,
                partyReferenceData,
                hasTestHarnessAccess: !!fgaRoleData?.hasTestHarnessAccess,
                permissionsLoadingComplete,
                hasPolicyIndexPageAccess:
                    !!fgaRoleData?.hasPolicyIndexPageAccess,
                isAllowReadIllustrations:
                    !!fgaRoleData?.isAllowReadIllustrations,
                hasEditServiceRequestAccess:
                    !!hasEditServiceRequestAccess?.data,
                hasUsagePermission: !!fgaRoleData?.hasUsagePermission,
                hasAiAssistantPermissions:
                    featureFlags[FEATURE_FLAGS.AI_ASSISTANT] &&
                    !!fgaRoleData?.hasAiAssistantPermissions,
                hasCallLogsAccess: !!fgaRoleData?.hasCallLogsAccess,
                hasNotesAccess: !!fgaRoleData?.hasNotesAccess,
                isZinniaInternalViewer: !!fgaRoleData?.isZinniaInternalViewer,
                hasPermissionToPrioritizeCases: !!writeCasePriority,
                isZinniaInternalProcessor:
                    !!fgaRoleData?.isZinniaInternalProcessor,
                isAllowWriteClientCase: !!writeClientCaseCarriers.length, //TODO: update this to check the ui access permission when CIAM implements
                isAllowOpsCaseReviewRequest: !!isAllowOpsCaseReviewRequest,
                hasMarketConnectContacts,
                isSuperIllustrator,
            }}
        >
            {children}
        </PermissionContext.Provider>
    );
};
