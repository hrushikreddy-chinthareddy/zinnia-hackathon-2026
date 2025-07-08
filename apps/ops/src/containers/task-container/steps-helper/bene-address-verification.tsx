import { TaskStatus } from '@deps/models/case/task-instance';

import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';
export const getBeneAddressVerificationSteps = ({
    taskType,
    taskInfoLink,
    t,
    taskMetadata,
    isContinueButtonEnabled,
    task,
}: GetStepsProps) => {
    const dynamicSteps = taskMetadata.map((metadata, index) => ({
        ariaLabel: metadata?.title || '',
        isVisible: () => true,
        component: (
            <TaskFormStep
                readonly={task.status === TaskStatus.Completed}
                isContinueButtonEnabled={isContinueButtonEnabled}
                taskInfoLink={taskInfoLink}
                isSubmit={true}
                taskMetadata={metadata}
                key={`step_${index}`}
            ></TaskFormStep>
        ),
        text: metadata?.title || '',
        isSubmit: true,
        index: index,
        isCompleted: true,
        screenReaderLabel: metadata?.title || '',
    }));

    const staticSteps: Step[] = [
        {
            isVisible: () => true,
            component: (
                <ConfirmStep
                    taskType={taskType}
                    taskInfoLink={taskInfoLink}
                    isCta={true}
                    ctaLink={`/cases/${task?.caseId}/progress`}
                />
            ),
            text: t('confirm'),
            index: dynamicSteps.length,
            screenReaderLabel: t('confirm'),
        },
    ];

    return [...dynamicSteps, ...staticSteps];
};
