import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';

import { GetStepsProps } from './types';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

const getDefaultTaskSteps = ({
    taskInfoLink,
    taskType,
    t,
    taskMetadata,
    readOnly,
}: GetStepsProps) => {
    const steps = taskMetadata.map((metadata, index) => ({
        ariaLabel: metadata?.title || '',
        isVisible: () => Boolean(true),
        component: (
            <TaskFormStep
                readonly={readOnly}
                taskInfoLink={taskInfoLink}
                isSubmit={!readOnly}
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
                ></ConfirmStep>
            ),
            text: t('confirm'),
            index: steps.length,
            screenReaderLabel: t('confirm'),
        },
    ];

    return [...steps, ...staticSteps];
};

export default getDefaultTaskSteps;
