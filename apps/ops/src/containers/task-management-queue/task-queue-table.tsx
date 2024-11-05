import { Table, TableRow, TableBody, TableCell } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import { Loader } from '@deps/components/page-loader';
import { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { AssignedTask } from '@deps/models/case/task-instance';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';
import styles from '@deps/utils/styles';

import TaskQueueTableHeader from './task-queue-table-header';
import TaskQueueTableRow from './task-queue-table-row';

type TaskQueueTableProps = {
    tasks: AssignedTask[];
    featureFlagDecisions: FeatureFlags;
    isLoading?: boolean;
};

const TaskQueueTable = ({ tasks, featureFlagDecisions, isLoading }: TaskQueueTableProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'taskManagementQueue' });

    return (
        <div className="my-1">
            <Table>
                <TaskQueueTableHeader />
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={6}>
                                <div className={styles.loaderContainer}>
                                    <Loader variant={PageLoaderVariant.Center}/>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                    {tasks?.map(task => {
                        return task && <TaskQueueTableRow task={task} key={`task_queue_${task.id}`} featureFlagDecisions={featureFlagDecisions}/>
                    })}
                    {!tasks.length && (
                        <TableRow className="disabled-tr w-full">
                            <TableCell className="!text-left md:!text-center" colSpan={6}>
                                <Typography variant={TypographyVariant.BodyBold} className="mt-1 text-center">
                                    {t('noTasksFoundTitle')}
                                </Typography>
                                <p className="mt-1 text-center font-secondary text-base font-normal">{t('noTasksMessage')}</p>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default TaskQueueTable;
