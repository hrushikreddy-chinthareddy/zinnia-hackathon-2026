import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@deps/components/button/button';
import { TranslationFiles } from '@deps/config/translations';
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

    const handleClaimTask = async () => {
        setErrorMessage('');
        setIsLoading(true);
        const res = await claimNextTask();

        if (res.status === 200) {
            const { data } = res;
            if (data.statusCode) {
                switch (data.statusCode) {
                    case 400:
                        setErrorMessage(t('claimTaskError') + data.message);
                        break;
                    case 404:
                        setErrorMessage(t('claimTaskError') + data.message);
                        break;
                    default:
                        setErrorMessage(t('claimTaskError') + data.message);
                        break;
                }
            } else {
                getTasks();
            }
        }
        setIsLoading(false);
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
    }, [])

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
                            disabled={taskDetails.length > 0}
                            variant={ButtonVariant.Default}
                        >
                            {t('claimTask')}
                        </Button>

                    </div>
                </div>

                {errorMessage && (
                    <AssistiveText text={errorMessage} variant={AssistiveTextVariant.Error} className="my-4" />
                )}

                <TaskQueueTable tasks={taskDetails} isLoading={isLoading} featureFlagDecisions={featureFlagDecisions} getTasks={getTasks} setErrorMessage={setErrorMessage} />
            </div>
        </>
    );
};

export default TaskManagementQueue;
