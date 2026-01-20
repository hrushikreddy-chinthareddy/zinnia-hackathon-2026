import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

export const getUpdateSuitabilityDataSteps = ({
    taskType,
    taskInfoLink,
    t,
    taskMetadata,
    readOnly,
}: GetStepsProps) => {
    const steps: Step[] = [
        {
            isVisible: () => true,
            component: (
                <TaskFormStep
                    readonly={readOnly}
                    isSaveAsDraftEnabled={!readOnly}
                    key={`step-${0}`}
                    isContinueButtonEnabled={true}
                    taskInfoLink={taskInfoLink}
                    isSubmit={false}
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
            component: (
                <TaskFormStep
                    readonly={readOnly}
                    isSaveAsDraftEnabled={false}
                    key={`step-${1}`}
                    isContinueButtonEnabled={true}
                    taskInfoLink={taskInfoLink}
                    isSubmit={!readOnly}
                    taskMetadata={taskMetadata[1]}
                ></TaskFormStep>
            ),
            text: taskMetadata[1]?.title || '',
            index: 1,
            isCompleted: true,
            screenReaderLabel: taskMetadata[1]?.title || '',
        },
        {
            isVisible: () => true,
            component: (
                <ConfirmStep
                    taskType={taskType}
                    taskInfoLink={taskInfoLink}
                ></ConfirmStep>
            ),
            text: t('confirm'),
            index: 2,
            screenReaderLabel: t('confirm'),
        },
    ];
    return steps;
};
