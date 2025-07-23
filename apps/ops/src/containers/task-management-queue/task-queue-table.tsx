import {
    Table,
    TableRow,
    TableBody,
    TableCell,
} from '@zinnia/bloom/components';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';

import { Loader } from '@deps/components/page-loader';
import { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { NO_ASSIGNEE } from '@deps/hooks/useTaskManagementQueue';
import { AssignedTask, UnassignedTask } from '@deps/models/case/task-instance';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';
import styles from '@deps/utils/styles';

import TaskQueueTableHeader from './task-queue-table-header';
import TaskQueueTableRow from './task-queue-table-row';
const PaginationControls = dynamic(
    () => import('@deps/components/pagination/pagination')
);

type TaskQueueTableProps = {
    tasks: (AssignedTask | UnassignedTask)[];
    featureFlagDecisions: FeatureFlags;
    isLoading?: boolean;
    showClaimTask?: boolean;
    getTasks: any;
    setTaskDetails: any;
    filters: any;
    attachAssigneesToTasks: any;
    additionalData: any;
    setErrorMessage: (message: string) => void;
    isOpsManagerView?: boolean;
    offset?: number;
    limit?: number;
    total?: number;
};

enum ColSpanConfig {
    'OpsManager' = 10,
    'Default' = 8,
}

const TaskQueueTable = ({
    tasks,
    filters,
    setTaskDetails,
    attachAssigneesToTasks,
    featureFlagDecisions,
    isLoading,
    showClaimTask,
    getTasks,
    additionalData,
    setErrorMessage,
    isOpsManagerView,
    offset,
    limit = 10,
    total,
}: TaskQueueTableProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'taskManagementQueue',
    });
    const { t: tTaskView } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'tasksView',
    });
    const paginationControls = () => {
        window.scrollTo(0, 0);
        const goToPage = (pageNumber: number) => {
            const newOffset = (pageNumber - 1) * limit;
            const filterData = filters?.additionalFilters
                ? { ...filters?.additionalFilters }
                : { ...additionalData?.taskListingParams };

            const payload = {
                ...filters,
                ...filterData,
                limit,
                offset: newOffset,
            };
            delete payload.additionalFilters;

            getTasks(true, payload);
        };

        return (
            isOpsManagerView && (
                <PaginationControls
                    total={total ?? 0}
                    limit={limit ?? 0}
                    offset={offset ?? 0}
                    goToPage={goToPage}
                />
            )
        );
    };

    const manageTableAfterAction = async (
        taskId: string,
        assigneePartyId: string
    ) => {
        const newTasks = [...tasks].map((task) => {
            if (task.id === taskId) {
                if (!assigneePartyId) {
                    delete task?.assigneePartyId;
                    task.assignee = NO_ASSIGNEE;
                    return task;
                } else {
                    task.assigneePartyId = assigneePartyId;
                    return task;
                }
            } else {
                return task;
            }
        });

        const newTasksWithUpdatedUsers = await attachAssigneesToTasks(newTasks);

        if (newTasksWithUpdatedUsers.length > 0) {
            setTaskDetails(newTasksWithUpdatedUsers);
        }
        return true;
    };

    return (
        <div className="my-1">
            <Table>
                <TaskQueueTableHeader isOpsManagerView={isOpsManagerView} />
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell
                                colSpan={
                                    isOpsManagerView
                                        ? ColSpanConfig.OpsManager
                                        : ColSpanConfig.Default
                                }
                            >
                                <div
                                    className={`${styles.loaderContainer} p-2`}
                                >
                                    <Loader
                                        variant={PageLoaderVariant.Center}
                                    />
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading &&
                        tasks?.map((task, index) => {
                            return (
                                task && (
                                    <TaskQueueTableRow
                                        task={task}
                                        key={`task_queue_${task.id}`}
                                        featureFlagDecisions={
                                            featureFlagDecisions
                                        }
                                        getTasks={() => {
                                            getTasks(true);
                                        }}
                                        setTaskDetails={setTaskDetails}
                                        manageTableAfterAction={
                                            manageTableAfterAction
                                        }
                                        setErrorMessage={setErrorMessage}
                                        tabIndex={index}
                                        isOpsManagerView={isOpsManagerView}
                                    />
                                )
                            );
                        })}
                    {tasks?.length === 0 && !isLoading && (
                        <TableRow className="disabled-tr w-full">
                            <TableCell
                                className="!text-left md:!text-center"
                                colSpan={
                                    isOpsManagerView
                                        ? ColSpanConfig.OpsManager
                                        : ColSpanConfig.Default
                                }
                            >
                                {showClaimTask ? (
                                    <>
                                        <Typography
                                            variant={TypographyVariant.BodyBold}
                                            className="text-center"
                                        >
                                            {t('noTasksFoundTitle')}
                                        </Typography>
                                        <p className="mt-1 text-center font-secondary text-base font-normal">
                                            {t('noTasksMessage')}
                                        </p>
                                    </>
                                ) : (
                                    <Typography
                                        className="p-2"
                                        variant={TypographyVariant.BodySm}
                                    >
                                        {t('noTasksFoundTitle')}
                                    </Typography>
                                )}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {isOpsManagerView && tasks?.length > 0 && (
                <div className="flex flex-col items-center lg:grid lg:grid-cols-3 mt-3">
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className={`mb-6 lg:mb-0`}
                    >
                        {tTaskView('xToYOfZ', {
                            x: (offset ?? 0) + 1,
                            y: Math.min(
                                (offset ?? 0) + (limit ?? 10),
                                total ?? 0
                            ),
                            z: `${total}${total === 10000 ? '+' : ''}`,
                        })}
                    </Typography>
                    {paginationControls()}
                </div>
            )}
        </div>
    );
};

export default TaskQueueTable;
