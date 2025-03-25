import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@deps/components/button/button';
import { TranslationFiles } from '@deps/config/translations';
import { MessageType } from '@deps/models/case/task';
import { AssignedTask, UnassignedTask } from '@deps/models/case/task-instance';
import { additionalDataProps } from '@deps/pages/home';
import { claimNextTask } from '@deps/queries/api/v1/claim-task';
import { getAssignedTasks, getUnassignedTasks } from '@deps/queries/api/v1/task';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

import TaskQueueTable from './task-queue-table';

export const NO_ASSIGNEE = 'No Assignee';

type TaskManagementQueueProps = {
    featureFlagDecisions: FeatureFlags;
    showClaimTask?: boolean;
    additionalData?: additionalDataProps;
};

const TaskManagementQueue = ({ featureFlagDecisions, showClaimTask, additionalData }: TaskManagementQueueProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'taskManagementQueue' });
    const [taskDetails, setTaskDetails] = useState<(AssignedTask | UnassignedTask)[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorType, setErrorType] = useState(MessageType.Error);
    const router = useRouter();

    const isHomePage = () => {
        return router.pathname.indexOf('home') > -1;
    };

    const handleClaimTask = async () => {
        setErrorMessage('');
        setIsLoading(true);
        try {
            const res = await claimNextTask();

            if (res.status === 200) {
                const { data } = res;
                if (data.statusCode) {
                    switch (data.statusCode) {
                        case 400:
                            setErrorMessage(data.message);
                            break;
                        case 404:
                            setErrorMessage(data.message);
                            setErrorType(MessageType.Info);
                            break;
                        default:
                            setErrorMessage(data.message);
                            break;
                    }
                } else {
                    await getTasks(true);
                }
            }
        } catch (error) {
            setErrorMessage(t('claimTaskError') || '');
        } finally {
            setIsLoading(false);
        }
    };

    const getTasks = async (handleLoader: boolean) => {
        const assignee: string = additionalData?.user?.name || '';

        setErrorMessage('');

        if (handleLoader) setIsLoading(handleLoader);

        try {
            const assignedTaskData = await getAssignedTasks();

            if (isHomePage()) {
                if (assignedTaskData.length > 0) {
                    setTaskDetails(
                        assignedTaskData.map(taskData => {
                            return { ...taskData, assignee };
                        })
                    );
                } else {
                    const unassignedTaskData = await getUnassignedTasks();
                    if (unassignedTaskData.length > 0) {
                        setTaskDetails([{ ...unassignedTaskData[0], assignee: NO_ASSIGNEE }]);
                    }
                }
            } else {
                setTaskDetails(assignedTaskData.map(task => ({ ...task, assignee: assignee || '' })));
            }
        } catch (error) {
            setErrorMessage(t('fetchTaskError') || '');
        } finally {
            if (handleLoader) setIsLoading(!handleLoader);
        }
    };

    useEffect(() => {
        getTasks(true);
    }, []);

    return (
        <>
            <div className="flex flex-col mb-4">
                {showClaimTask && (
                    <div className="my-3 flex justify-end">
                        <div className="self-center xl:mt-5 xl:self-baseline">
                            <Button
                                type={ButtonType.Primary}
                                onClick={handleClaimTask}
                                data-testid="claim-task"
                                aria-label={t('claimTask') as string}
                                size={ButtonSize.Small}
                                disabled={taskDetails.length > 0 || isLoading}
                                variant={ButtonVariant.Default}
                            >
                                {t('claimTask')}
                            </Button>
                        </div>
                    </div>
                )}
                {errorMessage && (
                    <AssistiveText
                        text={errorMessage}
                        variant={errorType == MessageType.Info ? AssistiveTextVariant.Info : AssistiveTextVariant.Error}
                        className="my-4"
                    />
                )}

                <TaskQueueTable
                    tasks={taskDetails}
                    isLoading={isLoading}
                    featureFlagDecisions={featureFlagDecisions}
                    showClaimTask={showClaimTask}
                    getTasks={() => {
                        getTasks(true);
                    }}
                    setErrorMessage={setErrorMessage}
                />
            </div>
        </>
    );
};

export default TaskManagementQueue;
