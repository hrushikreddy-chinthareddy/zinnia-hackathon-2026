import { getAccessToken } from '@auth0/nextjs-auth0';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import NoNavLayout from '@deps/components/no-nav-layout';
import { PageHead } from '@deps/components/page-title';
import { TranslationFiles } from '@deps/config/translations';
import { AE_FGA_ROLE } from '@deps/constants/advisors-excel';
import CaseOverviewRedesign from '@deps/containers/case-redesign-sub-page/index';
import { CaseActivityProvider } from '@deps/contexts/CaseActivityContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { Case } from '@deps/models/case/case';
import { UserPermission } from '@deps/models/user-profile';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import getCase from '@deps/queries/server/case/get-case';
import { CaseDetailsTabValues } from '@deps/types/constants';
import { FgaRelation } from '@deps/types/fga';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';

interface BaseCaseDetailsPageProps {
    caseDetails: Case;
    id?: string;
    tab?: string;
}

type CaseDetailsPageProps = BaseCaseDetailsPageProps & SegmentTrackedPageProps;

const CaseDetailsPage = ({ caseDetails, id, tab, user }: CaseDetailsPageProps) => {
    useSegmentPageTracker(user, SegmentPageName.CaseDetails, { caseId: id });

    return (
        <CaseActivityProvider caseDetails={caseDetails}>
            <PageHead titleKey="caseOverview" />
            <NoNavLayout>
                <CaseOverviewRedesign caseDetails={caseDetails} tab={tab} />
            </NoNavLayout>
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

            const hasPermissionToReadCaseManagement = await doesUserHavePagePermissions(
                context,
                UserPermission.AllowReadCaseManagement,
                loggingContext
            );
            const isAdvisorsExcel = await checkTuplePage(context, FgaRelation.Party, AE_FGA_ROLE, loggingContext);

            if (!isAdvisorsExcel && !hasPermissionToReadCaseManagement) {
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }

            const id = (params?.id as string) || '';
            const tab = (params?.tab as string) || '';

            const translations = await serverSideTranslations(locale, [TranslationFiles.COMMON, TranslationFiles.COLDEFS]);
            const caseDetails = await getCase({
                partyId: user.partyId,
                caseId: id,
                accessToken: accessToken as string,
                loggingContext,
            });

            if (!caseDetails?.data) {
                return {
                    redirect: {
                        destination: '/404',
                        permanent: false,
                    },
                };
            }

            if (!tab || !CaseDetailsTabValues[tab]) {
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
                    caseDetails: caseDetails.data,
                    id,
                    tab,
                    user,
                },
            };
        },
    },
    { file: 'cases/[id]/index', function: 'getServerSideProps', page: 'cases/:id' }
);

export default CaseDetailsPage;
