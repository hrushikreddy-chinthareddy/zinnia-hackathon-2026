import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@deps/components/button/button';
import { TranslationFiles } from '@deps/config/translations';
import { MessageType } from '@deps/models/case/task';
import { AssignedTask } from '@deps/models/case/task-instance';
import { claimNextTask } from '@deps/queries/api/v1/claim-task';
import { getAssignedTasks } from '@deps/queries/api/v1/task';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

import TaskQueueTable from './task-queue-table';

type TaskManagementQueueProps = {
    featureFlagDecisions: FeatureFlags;
};

const TaskManagementQueue = ({ featureFlagDecisions }: TaskManagementQueueProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'taskManagementQueue' });
    const [taskDetails, setTaskDetails] = useState<AssignedTask[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorType, setErrorType] = useState(MessageType.Error);

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
                    getTasks();
                }
            }
        } catch (error) {
            const errorMsg = t('claimTaskError');
            setErrorMessage(errorMsg);
        }
    };

    const getTasks = async (handleLoader = true) => {
        if (handleLoader) setIsLoading(true);
        const data = await getAssignedTasks();
        if (data) {
            setTaskDetails(data);
        }
        if (handleLoader) {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getTasks(true);
    }, []);

    return (
        <>
            <div className="flex flex-col mb-4">
                <div className="my-3 flex justify-end">
                    <div className="self-center xl:mt-5 xl:self-baseline">
                        <Button
                            type={ButtonType.Primary}
                            onClick={handleClaimTask}
                            data-testid="claim-task"
                            aria-label={t('claimTask') as string}
                            size={ButtonSize.Small}
                            disabled={false}
                            variant={ButtonVariant.Default}
                        >
                            {t('claimTask')}
                        </Button>
                    </div>
                </div>

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
                    getTasks={getTasks}
                    setErrorMessage={setErrorMessage}
                />
            </div>
        </>
    );
};

export default TaskManagementQueue;
