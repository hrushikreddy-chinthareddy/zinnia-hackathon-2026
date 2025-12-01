import { getAccessToken } from '@auth0/nextjs-auth0';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { PageHead } from '@deps/components/page-title';
import { TranslationFiles } from '@deps/config/translations';
import { AE_FGA_ROLE } from '@deps/constants/advisors-excel';
import CaseOverview from '@deps/containers/case-sub-page/index';
import { CaseActivityProvider } from '@deps/contexts/CaseActivityContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import {
    doesUserHavePagePermissions,
    getUserData,
} from '@deps/helpers/query-data.helpers';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { Case } from '@deps/models/case/case';
import { UserPermission } from '@deps/models/user-profile';
import { getCaseDetailsSSR } from '@deps/queries/api/cases';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import { readUserTuplesPage } from '@deps/queries/api/server/fga/readTuples';
import { CaseDetailsTabValues } from '@deps/types/constants';
import { FgaRelation, UserTuplesData } from '@deps/types/fga';
import {
    SegmentPageName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
import { FgaRoles } from '@deps/utils/auth';
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

interface BaseCaseDetailsPageProps {
    caseDetails: Case;
    id?: string;
    tab?: string;
    userTuplesData: UserTuplesData;
}

type CaseDetailsPageProps = BaseCaseDetailsPageProps & SegmentTrackedPageProps;

const CaseDetailsPage = ({
    caseDetails,
    id,
    tab,
    user,
    userTuplesData,
}: CaseDetailsPageProps) => {
    useSegmentPageTracker(user, SegmentPageName.CaseDetails, { caseId: id });

    return (
        <CaseActivityProvider
            caseDetails={caseDetails}
            userTuplesData={userTuplesData}
        >
            <PageHead titleKey="caseOverview" />

            <CaseOverview caseDetails={caseDetails} tab={tab} />
        </CaseActivityProvider>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);
            const { locale = DEFAULT_LOCALE, params, req, res } = context;

            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('cases/:id::Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            const tuplesQuery = `user=party:${user.partyId}&object=role:&pageSize=100`;
            const userTuplesData: any = await readUserTuplesPage(
                context,
                tuplesQuery,
                loggingContext
            );

            const featureFlagDecisions: FeatureFlags =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    loggingContext
                );

            if (
                featureFlagDecisions?.[
                    FEATURE_FLAGS.FGA_ENTITY_ZINNIA_LIVE_CASE_MANAGEMENT
                ]
            ) {
                const hasPermissionToReadCaseManagement =
                    featureFlagDecisions?.[FEATURE_FLAGS.ENTERPRISE_SEARCH_CASE]
                        ? await checkTuplePage(
                              context,
                              FgaRelation.UiAccess,
                              FgaRoles.CASE_MANAGEMENT_ZL_ENTITY,
                              loggingContext
                          )
                        : await doesUserHavePagePermissions(
                              context,
                              UserPermission.AllowReadCaseManagement,
                              loggingContext
                          );
                const isAdvisorsExcel = await checkTuplePage(
                    context,
                    FgaRelation.Party,
                    AE_FGA_ROLE,
                    loggingContext
                );

                if (!isAdvisorsExcel && !hasPermissionToReadCaseManagement) {
                    return {
                        redirect: {
                            destination: '/403',
                            permanent: false,
                        },
                    };
                }
            }

            const isPermittedToViewRawData = await checkTuplePage(
                context,
                FgaRelation.Party,
                FgaRoles.ZINNIA_INTERNAL_VIEWER,
                loggingContext
            );

            const id = (params?.id as string) || '';
            const tab = (params?.tab as string) || '';

            const translations = await serverSideTranslations(locale, [
                TranslationFiles.COMMON,
                TranslationFiles.COLDEFS,
            ]);
            const caseDetails = await getCaseDetailsSSR(
                id,
                accessToken as string,
                loggingContext,
                featureFlagDecisions
            );

            if (!caseDetails) {
                return {
                    redirect: {
                        destination: '/404',
                        permanent: false,
                    },
                };
            }

            const canViewRawData =
                featureFlagDecisions[FEATURE_FLAGS.SHOW_RAW_DATA] &&
                isPermittedToViewRawData;
            if (
                !tab ||
                !CaseDetailsTabValues[tab] ||
                (tab === CaseDetailsTabValues['raw-data'] && !canViewRawData)
            ) {
                return {
                    redirect: {
                        destination: `/cases/${id}/${CaseDetailsTabValues.progress}`,
                        permanent: false,
                    },
                    props: {},
                };
            }
            return {
                props: {
                    ...translations,
                    caseDetails,
                    id,
                    tab,
                    user,
                    userTuplesData,
                },
            };
        },
    },
    {
        file: 'cases/[id]/index',
        function: 'getServerSideProps',
        page: 'cases/:id',
    }
);

export default CaseDetailsPage;
