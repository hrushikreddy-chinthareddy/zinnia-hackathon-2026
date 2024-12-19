import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback, useEffect, useMemo, useState } from 'react';

import CaseLayout from '@deps/components/case-layout';
import CaseOverviewNavDrawer from '@deps/components/case-overview-nav-drawer/case-overview-nav-drawer';
import CaseType from '@deps/components/case-type/case-type';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import NoNavLayout from '@deps/components/no-nav-layout';
import OneOrManyHeader from '@deps/components/one-or-many-header/one-or-many-header';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';
import { TranslationFiles } from '@deps/config/translations';
import { AE_FGA_ROLE } from '@deps/constants/advisors-excel';
import CaseOverviewGlobal from '@deps/containers/case-overview/case-overview-global/case-overview-global';
import TasksTable from '@deps/containers/case-overview/tasks-table/tasks-table';
import CaseOverviewRedesign from '@deps/containers/case-redesign-sub-page/index';
import { CaseActivityProvider } from '@deps/contexts/CaseActivityContext';
import { CaseOverviewNavDrawerProvider } from '@deps/contexts/CaseOverviewNavDrawer';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { SideSheetProvider } from '@deps/contexts/SideSheetContext';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { shouldNavbarOverlay } from '@deps/helpers/page-layout';
import { getAgents, getPolicyOwners } from '@deps/helpers/parties';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { formatDateDescriptionList, formatDateForAriaLabel, formatSSN, toTitleCase } from '@deps/helpers/string.helper';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { Case, CaseIdentifier } from '@deps/models/case/case';
import { PartyInstance } from '@deps/models/case/party-instance';
import { ManagementTask } from '@deps/models/case/task-instance';
import { UserPermission } from '@deps/models/user-profile';
import { checkTupleSsr } from '@deps/queries/api/fga';
import { getCaseTaskInstances } from '@deps/queries/api/v1/task';
import getCase from '@deps/queries/server/case/get-case';
import { SCREEN_BREAKPOINTS, DEFAULT_ERROR_STRING, CaseDetailsTabValues } from '@deps/types/constants';
import { FgaRelation } from '@deps/types/fga';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { getUserInfoFromUser, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

interface BaseCaseDetailsPageProps {
    caseDetails: Case;
    isNavDrawerOpen?: boolean;
    isLargeScreen?: boolean;
    id?: string;
    tab?: string;
}

type CaseDetailsPageProps = BaseCaseDetailsPageProps & SegmentTrackedPageProps;

type CaseDetailsHeaderProps = BaseCaseDetailsPageProps;

const PopoverBody = ({ agents }: { agents: PartyInstance[] }) => (
    <div className="flex min-w-max flex-col items-start bg-inherit">
        {agents.map((agent, index) => {
            return (
                <div
                    key={index}
                    className="w-full border-b-2 border-solid border-gray-800 py-2 first:p-0 first:pb-2 last:border-0 last:p-0 last:pt-2"
                >
                    <p className="font-secondary text-md font-normal text-white">{toTitleCase(agent.fullName)}</p>
                </div>
            );
        })}
    </div>
);

const CaseDetailsHeader = ({ caseDetails, isNavDrawerOpen, isLargeScreen }: CaseDetailsHeaderProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const policyOwners = getPolicyOwners(caseDetails?.parties || []);
    const policyOwnersToDisplay = policyOwners.map(owner => ({ name: toTitleCase(owner.fullName), ssn: formatSSN(owner.ssn) }));

    const ssn = policyOwners?.[0]?.ssn;

    const agents = getAgents(caseDetails?.parties || []);
    const restOfTheAgents = agents.slice(1);
    const headerResponsiveClasses =
        isNavDrawerOpen && isLargeScreen ? 'xs:grid-cols-5 xl:grid-cols-7' : 'xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-7';

    const documentNumber = getCaseIdentifierValue(caseDetails?.identifiers, CaseIdentifier.DocumentNumber);

    return (
        <div className="flex max-w-full flex-col items-start">
            <div className="flex">
                <CaseType variant="horizontal" caseType={caseDetails?.process} subType={caseDetails?.processSubType} />
            </div>

            <div className="flex">
                <OneOrManyHeader className="line-clamp-2 break-all" entities={policyOwnersToDisplay} />
            </div>

            <div className={`mt-9 grid grid-flow-row-dense gap-x-8 gap-y-4  ${headerResponsiveClasses}`}>
                <div data-testid="case-created-at" className="flex flex-col">
                    <p
                        className="field-label font-bold text-gray-900"
                        aria-label={
                            t('ariaLabel.createdAt', {
                                date: caseDetails?.createdAt
                                    ? formatDateForAriaLabel(new Date(caseDetails.createdAt))
                                    : t('ariaLabel.notAvailable'),
                            }) as string
                        }
                    >
                        {t('caseManagementDashboard.case.createdAt')}
                    </p>
                    <p className="body-sm text-gray-900">{formatDateDescriptionList(new Date(caseDetails?.createdAt))}</p>
                </div>

                <div data-testid="case-updated-at" className="flex flex-col">
                    <p
                        className="field-label font-bold text-gray-900"
                        aria-label={
                            t('ariaLabel.updatedAt', {
                                date: caseDetails?.updatedAt
                                    ? formatDateForAriaLabel(new Date(caseDetails.updatedAt))
                                    : t('ariaLabel.notAvailable'),
                            }) as string
                        }
                    >
                        {t('caseManagementDashboard.case.updatedAt')}
                    </p>
                    <p className="body-sm text-gray-900">{formatDateDescriptionList(new Date(caseDetails?.updatedAt))}</p>
                </div>

                <div data-testid="case-policy-number" className="flex flex-col">
                    <p
                        className="field-label whitespace-nowrap font-bold text-gray-900"
                        aria-label={
                            t('ariaLabel.policyNumber', {
                                policyNumber: caseDetails?.policyNumber ?? t('ariaLabel.notAvailable'),
                            }) as string
                        }
                    >
                        {t('caseManagementDashboard.case.policyNumber')}
                    </p>
                    <p className="body-sm break-all text-gray-900">
                        <PiiWrapper>{caseDetails?.policyNumber ?? DEFAULT_ERROR_STRING}</PiiWrapper>
                    </p>
                </div>

                <div className="flex flex-col">
                    <p
                        className="field-label font-bold text-gray-900"
                        aria-label={
                            t('ariaLabel.ssn', {
                                ssnLastFour: ssn ? formatSSN(ssn) : t('ariaLabel.notAvailable'),
                            }) as string
                        }
                    >
                        {t('caseManagementDashboard.case.ssn')}
                    </p>
                    <p className="body-sm text-gray-900">
                        <PiiWrapper>{formatSSN(ssn)}</PiiWrapper>
                    </p>
                </div>

                <div className="flex flex-col">
                    <p
                        className="field-label whitespace-nowrap font-bold text-gray-900"
                        aria-label={
                            t('ariaLabel.productName', {
                                productName: caseDetails?.productName ?? t('ariaLabel.notAvailable'),
                            }) as string
                        }
                    >
                        {t('caseManagementDashboard.case.productName')}
                    </p>
                    <p className="body-sm line-clamp-2 break-all text-gray-900">
                        {caseDetails?.productName ? toTitleCase(caseDetails?.productName) : DEFAULT_ERROR_STRING}
                    </p>
                </div>

                <div className="flex flex-col">
                    <div className="flex flex-row items-center gap-8">
                        <p className="field-label font-bold text-gray-900">{t('caseManagementDashboard.case.agent')}</p>
                        {agents.length > 1 && (
                            <Tooltip
                                body={<PopoverBody agents={restOfTheAgents} />}
                                placement={PopoverPlacement.TopRight}
                                popoverClassName="p-4"
                            >
                                <div className="flex items-center">
                                    <NavElement type={NavElementType.Button} size={NavElementSize.ExtraSmall}>
                                        +{agents.length - 1} {t('tooltip.other')}
                                    </NavElement>
                                </div>
                            </Tooltip>
                        )}
                    </div>
                    <p className="body-sm line-clamp-2 break-all text-gray-900">
                        {agents[0]?.fullName ? toTitleCase(agents[0].fullName) : DEFAULT_ERROR_STRING}
                    </p>
                </div>

                <div data-testid="case-case-id" className="flex flex-col">
                    <p
                        className="field-label font-bold text-gray-900"
                        aria-label={
                            t('ariaLabel.caseId', {
                                caseId: caseDetails?.id ? caseDetails.id : t('ariaLabel.notAvailable'),
                            }) as string
                        }
                    >
                        {t('caseManagementDashboard.case.caseId')}
                    </p>
                    <p className="body-sm break-all text-gray-900">{caseDetails?.id ?? DEFAULT_ERROR_STRING}</p>
                </div>
                <div data-testid="case-document-number" className="flex flex-col">
                    <p
                        className="field-label font-bold text-gray-900"
                        aria-label={
                            t('ariaLabel.documentNumber', {
                                caseId: documentNumber || t('ariaLabel.notAvailable'),
                            }) as string
                        }
                    >
                        {t('caseManagementDashboard.case.documentNumber')}
                    </p>
                    <p className="body-sm text-gray-900">{documentNumber || DEFAULT_ERROR_STRING}</p>
                </div>
            </div>
        </div>
    );
};

const CaseDetailsPage = ({ caseDetails, id, tab, user }: CaseDetailsPageProps) => {
    const [isLargeScreen, setIsLargeScreen] = useState(false); // isLargeScreen true means screen width is >= 1025
    const [isOpenOverride, setIsOpenOverride] = useState<null | boolean>(null);
    const [tasks, setTasks] = useState<ManagementTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { featureFlags, areFlagsLoading } = useOptimizely();

    useSegmentPageTracker(user, SegmentPageName.CaseDetails, { caseId: id });

    const handleResize = () => {
        if (window.innerWidth >= SCREEN_BREAKPOINTS.lg) {
            setIsLargeScreen(true);
        } else {
            setIsLargeScreen(false);
        }
    };

    const getTasks = useCallback(async () => {
        const tasks = await getCaseTaskInstances({
            caseId: id,
            sortBy: 'updatedAt',
            sortDirection: 'asc',
            offset: '0', // DEPU-1266 are we paginating?
            limit: '10',
        });

        setIsLoading(false);
        setTasks(tasks || []);
    }, [id]);

    // Set state on mount and resize
    useEffect(() => {
        getTasks();
        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [getTasks]);

    // If the user has manually opened or closed the nav drawer, we want to override the default behavior
    const isNavDrawerOpen = useMemo(() => {
        return isOpenOverride !== null ? isOpenOverride : isLargeScreen;
    }, [isOpenOverride, isLargeScreen]);

    // On small screen sizes where the user has manually opened the nav drawer, do NOT overlay.
    const shouldOverlay = useMemo(() => {
        return shouldNavbarOverlay(isLargeScreen, isOpenOverride);
    }, [isLargeScreen, isOpenOverride]);

    const classes = clsx('height-adjusted grid w-full', {
        'grid-cols-[52px,auto]': shouldOverlay,
        'grid-cols-[348px,auto]': !shouldOverlay,
    });

    if (!caseDetails?.id) {
        return (
            <CaseLayout>
                <PageHead titleKey="caseOverview" />
                <CaseDetailsHeader caseDetails={caseDetails} isNavDrawerOpen={isNavDrawerOpen} isLargeScreen={isLargeScreen} />
                <div className="center mt-8">
                    We couldn't find details for this case with an ID of: {id}
                    <span role="img" aria-label="sad">
                        😢
                    </span>
                </div>
            </CaseLayout>
        );
    }

    if (featureFlags[FEATURE_FLAGS.CASE_MANAGEMENT_CASE_REDESIGN_ENABLED]) {
        return (
            <CaseActivityProvider caseDetails={caseDetails}>
                <PageHead titleKey="caseOverview" />
                <NoNavLayout>
                    <CaseOverviewRedesign caseDetails={caseDetails} tab={tab} featureFlags={featureFlags} />
                </NoNavLayout>
            </CaseActivityProvider>
        );
    }

    // this is not great but it's better than the current flash
    return isLoading || areFlagsLoading ? (
        <></>
    ) : (
        <CaseOverviewNavDrawerProvider>
            <PageHead titleKey="caseOverview" />
            <CaseActivityProvider caseDetails={caseDetails}>
                <SideSheetProvider>
                    <CaseLayout caseDetails={caseDetails}>
                        <div className={classes}>
                            <CaseOverviewNavDrawer
                                caseStatus={caseDetails.caseStatus}
                                stages={caseDetails.stages}
                                setIsOpenOverride={setIsOpenOverride}
                                shouldOverlay={shouldOverlay}
                                isNavDrawerOpen={isNavDrawerOpen}
                            />
                            <div className="min-w-0 px-4 pt-4.5 md:px-6 md:pt-6.5 lg:px-8 lg:pt-8.5">
                                <div className="max-w-[1130px]">
                                    <CaseDetailsHeader
                                        caseDetails={caseDetails}
                                        isNavDrawerOpen={isNavDrawerOpen}
                                        isLargeScreen={isLargeScreen}
                                    />
                                    <div className="my-8 rounded-lg bg-white">
                                        {isLoading ? (
                                            <PageLoader variant={PageLoaderVariant.Center} />
                                        ) : (
                                            <TasksTable tasks={tasks} caseId={caseDetails.id} />
                                        )}
                                    </div>
                                    <div className="py-8">
                                        <CaseOverviewGlobal caseDetails={caseDetails} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CaseLayout>
                </SideSheetProvider>
            </CaseActivityProvider>
        </CaseOverviewNavDrawerProvider>
    );
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: any) => {
        const user = await getUserData(context);
        const { locale = DEFAULT_LOCALE, params, req, res } = context;

        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('cases/:id::Access token expired', {
                ...parseErrorInformation(e),
                file: 'cases/:id/index',
                function: 'getServerSideProps',
            });
            return serverSidePropsLogout();
        }

        const hasPermissionToReadCaseManagement = await doesUserHavePagePermissions(
            accessToken,
            user,
            UserPermission.AllowReadCaseManagement
        );
        const isAdvisorsExcel = await checkTupleSsr(accessToken as string, user.partyId, FgaRelation.Party, AE_FGA_ROLE);

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
            loggingContext: { file: 'cases/:id', function: 'getServerSideProps', ...getUserInfoFromUser(user) },
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
});

export default CaseDetailsPage;
