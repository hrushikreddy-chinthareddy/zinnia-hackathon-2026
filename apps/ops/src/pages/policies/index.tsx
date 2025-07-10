import { getAccessToken } from '@auth0/nextjs-auth0';
import { FgaRoles } from '@xd/utils/dist';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { createContext } from 'react';

import Loading from '@deps/components/loading/loading';
import { PolicyIndexCardView } from '@deps/components/policy-index/policy-index-card-view';
import { PolicyIndexTableView } from '@deps/components/policy-index/policy-index-table-view';
import { SearchBarInitialValues } from '@deps/components/search/search-bar';
import { TranslationFiles } from '@deps/config/translations';
import { AE_FGA_ROLE } from '@deps/constants/advisors-excel';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import {
    doesUserHavePagePermissions,
    getUserData,
} from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { UserPermission } from '@deps/models/user-profile';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import { FgaRelation } from '@deps/types/fga';
import { SearchViewQuery } from '@deps/types/search';
import { SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import {
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

export interface DashboardContextProps {
    searchValue: SearchViewQuery;
}

export const DashboardContext = createContext<DashboardContextProps>({
    searchValue: SearchBarInitialValues,
});

interface PolicyManagementDashboardProps extends SegmentTrackedPageProps {}

//TODO: When we're done with the feature flag, pull all of the code from `PolicyIndexTableView` into this page component and delete the old ones
const PolicyManagementDashboard = ({
    user,
}: PolicyManagementDashboardProps) => {
    const { hasPolicyIndexPageAccess, permissionsLoadingComplete } =
        usePermissionsContext();
    const { featureFlags } = useOptimizely();

    if (!permissionsLoadingComplete) {
        return <Loading />;
    }

    if (
        hasPolicyIndexPageAccess &&
        featureFlags?.[FEATURE_FLAGS.POLICY_INDEX_TABLE_VIEW]
    ) {
        return <PolicyIndexTableView user={user} />;
    } else {
        return <PolicyIndexCardView user={user} />;
    }
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            // Get the user object from the Auth0 Session
            const user = await getUserData(context);
            const { locale = DEFAULT_LOCALE, res, req } = context;
            try {
                (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('policies/index:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            const featureFlagDecisions: FeatureFlags =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    loggingContext
                );
            const hasPermissionToReadPolicyManagement = featureFlagDecisions?.[
                FEATURE_FLAGS.ENTERPRISE_SEARCH_POLICY
            ]
                ? await checkTuplePage(
                      context,
                      FgaRelation.UiAccess,
                      FgaRoles.POLICY_MANAGEMENT_ZL_ENTITY,
                      loggingContext
                  )
                : await doesUserHavePagePermissions(
                      context,
                      UserPermission.AllowReadPolicyAdmin,
                      loggingContext
                  );
            const isAdvisorsExcel = await checkTuplePage(
                context,
                FgaRelation.Party,
                AE_FGA_ROLE,
                loggingContext
            );

            if (!isAdvisorsExcel && !hasPermissionToReadPolicyManagement) {
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }

            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                nextI18nextConfig,
                ALL_LOCALES
            );

            return {
                props: {
                    locale,
                    user,
                    ...translations,
                },
            };
        },
    },
    { file: 'policies/index', function: 'getServerSideProps', page: 'policies' }
);

export default PolicyManagementDashboard;
