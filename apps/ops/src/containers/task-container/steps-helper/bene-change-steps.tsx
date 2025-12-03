import { TaskType } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';

import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

export const getBeneChangeSteps = ({
    taskInfoLink,
    task,
    taskType,
    t,
    taskMetadata,
    isContinueButtonEnabled,
}: GetStepsProps) => {
    const readOnly = task.status === TaskStatus.Completed;
    const isIssueResolved = task.data.issueResolved;

    const dynamicSteps = taskMetadata.map((metadata, index) => ({
        ariaLabel: metadata?.title || '',
        isVisible: () => index === 0 || isIssueResolved,
        component: (
            <TaskFormStep
                readonly={readOnly}
                taskInfoLink={taskInfoLink}
                isSubmit={
                    (index ===
                        (taskType === TaskType.Initiate_BeneChange_Transaction
                            ? 4
                            : 3) &&
                        !readOnly) ||
                    !isIssueResolved
                }
                taskMetadata={metadata}
                key={`step_${index}`}
                isContinueButtonEnabled={isContinueButtonEnabled}
                overrideTitle={true}
            ></TaskFormStep>
        ),
        text: metadata?.title || '',
        index: index,
        screenReaderLabel: metadata?.title || '',
    }));

    const staticSteps: Step[] = [
        {
            isVisible: () => true,
            component: (
                <ConfirmStep
                    taskType={taskType}
                    taskInfoLink={taskInfoLink}
                ></ConfirmStep>
            ),
            text: t('confirm'),
            index: dynamicSteps.length,
            screenReaderLabel: t('confirm'),
        },
    ];

    return [...dynamicSteps, ...staticSteps];
};
