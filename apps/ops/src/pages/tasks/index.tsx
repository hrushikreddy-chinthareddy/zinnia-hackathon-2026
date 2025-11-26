/* eslint-disable import/no-unresolved */
import { getAccessToken } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';

import { PageHead } from '@deps/components/page-title';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import TaskManagementQueue from '@deps/containers/task-management-queue/task-management-queue-container';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { _QUEUE_ADMIN, ADMIN_ROLE } from '@deps/helpers/ops-manager.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { UserPermission, UserProfile } from '@deps/models/user-profile';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import { listCarriersPage } from '@deps/queries/api/server/fga/listCarriers';
import { readUserTuplesPage } from '@deps/queries/api/server/fga/readTuples';
import { FgaUiEntity } from '@deps/types/fga';
import { FgaRelation } from '@deps/utils/auth';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import {
    LoggingContext,
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

export type TaskListingParams = {
    carriers: string[];
    queues: string[];
};

export type additionalDataProps = {
    user: UserProfile;
    taskListingParams: TaskListingParams;
    assigneeList: string[];
};

interface TasksPageProps {
    featureFlagDecisions: FeatureFlags;
    additionalData: additionalDataProps;
    authorizedCarriers: string[];
    isOpsManagerView: boolean;
}

type UserTuple = {
    key: {
        object: string;
    };
};

type FGATuple = {
    key: {
        object: string;
    };
};

export default function TasksPage({
    featureFlagDecisions,
    additionalData,
    authorizedCarriers,
    isOpsManagerView,
}: TasksPageProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'tasksView',
    });

    const filteredCarriers = authorizedCarriers.filter((carrier: string) =>
        additionalData?.taskListingParams?.carriers.includes(
            carrier.toUpperCase()
        )
    );

    return (
        <>
            <PageHead titleKey="tasks" />
            <Typography variant={TypographyVariant.H1} className="md:mb-5 mb-4">
                {t('header.title')}
            </Typography>
            <div className="bg-white rounded-md shadow-md w-100 p-8 pb-4">
                <TaskManagementQueue
                    featureFlagDecisions={featureFlagDecisions}
                    additionalData={{
                        ...additionalData,
                        authorizedCarriers: filteredCarriers,
                    }}
                    showClaimTask={false}
                    isOpsManagerView={isOpsManagerView}
                />
            </div>
        </>
    );
}

function extractQueueName(object: string): string {
    const parts = object.split(':')[1];
    const start = parts.indexOf('_') + 1;
    const end = parts.lastIndexOf(_QUEUE_ADMIN);
    return parts.slice(start, end);
}

function extractCarrierName(object: string): string {
    return object.split(':')[1].split('_')[0].toUpperCase();
}

function extractTaskListingParamsFromTuples(
    tuples: FGATuple[]
): TaskListingParams {
    const carriers = new Set<string>();
    const queues = new Set<string>();

    for (const tuple of tuples) {
        const object = tuple.key.object;
        if (object.includes(_QUEUE_ADMIN)) {
            carriers.add(extractCarrierName(object));
            queues.add(extractQueueName(object));
        }
    }

    return {
        carriers: Array.from(carriers),
        queues: Array.from(queues),
    };
}

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (
            context: GetServerSidePropsContext,
            loggingContext: LoggingContext
        ) => {
            const { locale = DEFAULT_LOCALE, res, req } = context;
            const user = await getUserData(context);

            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('tasks:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            if (!accessToken) {
                return serverSidePropsLogout();
            }

            const hasPagePermissions = await checkTuplePage(
                context,
                UserPermission.AllowReadOtpRenewals,
                `role_template:${UserPermission.AllowReadOtpRenewals}`,
                loggingContext
            );

            const taskManagementAccess = await checkTuplePage(
                context,
                FgaRelation.UiAccess,
                FgaUiEntity.ZinniaLiveTaskManagment,
                loggingContext
            );

            const tuplesQuery = `user=party:${user.partyId}&object=role:&pageSize=100`;
            const userTuplesData: any = await readUserTuplesPage(
                context,
                tuplesQuery,
                loggingContext
            );

            const isAdmin = userTuplesData?.tuples?.some((tuple: UserTuple) =>
                tuple?.key?.object.includes(ADMIN_ROLE)
            );

            let taskListingParams: TaskListingParams = {
                carriers: [],
                queues: [],
            };

            let isOpsManagerView = false;
            if (!isAdmin || !taskManagementAccess) {
                logWarn('tasks:: Permission not available', {
                    ...{ isAdmin, taskManagementAccess },
                    ...loggingContext,
                });
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            } else {
                isOpsManagerView = isAdmin;
            }

            if (userTuplesData?.tuples) {
                taskListingParams = extractTaskListingParamsFromTuples(
                    userTuplesData?.tuples
                );
            }

            //needed to generate assignee list for sidesheet
            // const searchUsersFromQueue =
            //     selectedCarrier && selectedQueue
            //         ? await searchedUsersPage(
            //               context,
            //               { carrier: selectedCarrier, queue: selectedQueue, access: PROCESSOR_ROLE },
            //               loggingContext
            //           )
            //         : [];

            // const assigneeList =
            //     searchUsersFromQueue?.length > 0
            //         ? searchUsersFromQueue.map((assignee: AssigneeUser) => assignee.email.split('@')[0].split('.').join(' '))
            //         : [];

            const additionalData: additionalDataProps = {
                user,
                taskListingParams,
                assigneeList: [],
            };
            const featureFlagDecisions =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    loggingContext
                );

            const enableTaskView =
                featureFlagDecisions?.[FEATURE_FLAGS.OPS_MANAGER_FEATURE];

            if (!enableTaskView || !hasPagePermissions) {
                logWarn('tasks:: Ops-Manager feature not enabled', {
                    ...{ enableTaskView, hasPagePermissions },
                    ...loggingContext,
                });
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }

            const authorizedCarriers = await listCarriersPage(
                context,
                UserPermission.AllowReadCaseManagement,
                loggingContext
            );
            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON],
                nextI18nextConfig,
                ALL_LOCALES
            );

            return {
                props: {
                    locale,
                    ...translations,
                    authorizedCarriers,
                    featureFlagDecisions,
                    additionalData,
                    isOpsManagerView,
                },
            };
        },
    },
    { file: 'tasks', function: 'getServerSideProps', page: 'tasks' }
);
