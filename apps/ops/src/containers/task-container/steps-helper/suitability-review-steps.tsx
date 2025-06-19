import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';
import { TaskStatus } from '@deps/models/case/task-instance';

export const getSuitabilityReviewSteps = ({
    task,
    taskType,
    isSaveAsDraftEnabled,
    isContinueButtonEnabled,
    taskInfoLink,
    t,
    taskMetadata,
}: GetStepsProps) => {
    const readOnly = task.status === TaskStatus.Completed;
    const steps: Step[] = [
        {
            isVisible: () => true,
            component: (
                <TaskFormStep
                    readonly={readOnly}
                    isSaveAsDraftEnabled={readOnly ? false : isSaveAsDraftEnabled}
                    isContinueButtonEnabled={isContinueButtonEnabled}
                    taskInfoLink={taskInfoLink}
                    isSubmit={readOnly ? false : true}
                    taskMetadata={taskMetadata[0]}
                ></TaskFormStep>
            ),
            text: taskMetadata[0]?.title || '',
            index: 0,
            isCompleted: true,
            screenReaderLabel: taskMetadata[0]?.title || '',
        },
        {
            isVisible: () => true,
            component: <ConfirmStep taskType={taskType} taskInfoLink={taskInfoLink}></ConfirmStep>,
            text: t('confirm'),
            index: 1,
            screenReaderLabel: t('confirm'),
        },
    ];
    return steps;
};
