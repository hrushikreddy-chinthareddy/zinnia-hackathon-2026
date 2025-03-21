import { Table, TableRow, TableBody, TableCell } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import { Loader } from '@deps/components/page-loader';
import { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { AssignedTask, UnassignedTask } from '@deps/models/case/task-instance';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';
import styles from '@deps/utils/styles';

import TaskQueueTableHeader from './task-queue-table-header';
import TaskQueueTableRow from './task-queue-table-row';

type TaskQueueTableProps = {
    tasks: (AssignedTask | UnassignedTask)[];
    featureFlagDecisions: FeatureFlags;
    isLoading?: boolean;
    showClaimTask?: boolean;
    getTasks: (handleLoader: boolean) => void;
    setErrorMessage: (message: string) => void;
};

const TaskQueueTable = ({ tasks, featureFlagDecisions, isLoading, showClaimTask, getTasks, setErrorMessage }: TaskQueueTableProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'taskManagementQueue' });

    return (
        <div className="my-1">
            <Table>
                <TaskQueueTableHeader />
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={8}>
                                <div className={`${styles.loaderContainer} p-2`}>
                                    <Loader variant={PageLoaderVariant.Center} />
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
                                        featureFlagDecisions={featureFlagDecisions}
                                        getTasks={() => {
                                            getTasks(true);
                                        }}
                                        setErrorMessage={setErrorMessage}
                                        tabIndex={index}
                                    />
                                )
                            );
                        })}
                    {tasks.length === 0 && !isLoading && (
                        <TableRow className="disabled-tr w-full">
                            <TableCell className="!text-left md:!text-center" colSpan={8}>
                                {showClaimTask ? (
                                    <>
                                        <Typography variant={TypographyVariant.BodyBold} className="text-center">
                                            {t('noTasksFoundTitle')}
                                        </Typography>
                                        <p className="mt-1 text-center font-secondary text-base font-normal">{t('noTasksMessage')}</p>
                                    </>
                                ) : (
                                    <Typography className="p-2" variant={TypographyVariant.BodySm}>
                                        {t('noTasks')}
                                    </Typography>
                                )}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default TaskQueueTable;
