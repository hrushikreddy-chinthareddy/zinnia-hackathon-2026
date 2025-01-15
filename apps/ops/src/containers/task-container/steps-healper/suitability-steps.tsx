import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { NigoDetailsStep } from '../components/steps/nigo-details/nigo-details-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';
import { TaskReviewStep } from '../components/steps/task-review/task-review-step';

export const getSuitabilitySteps = ({
    carrierId,
    caseId,
    taskInfoLink,
    taskType,
    isReadyForDataEntry,
    t,
    nigoExceptions,
    nigoSubExceptions,
    taskMetadata,
}: GetStepsProps) => {
    const steps: Step[] = [
        {
            ariaLabel: t('tabs.taskReview'),
            isVisible: () => true,
            component: <TaskReviewStep caseId={caseId} clientCode={carrierId} taskInfoLink={taskInfoLink} taskType={taskType} />,
            text: t('tabs.start'),
            index: 0,
            isCompleted: true,
            screenReaderLabel: t('tabs.taskReview'),
        },
        {
            ariaLabel: t('tabs.suitabilityForm'),
            isVisible: () => isReadyForDataEntry,
            component: <TaskFormStep taskInfoLink={taskInfoLink} isSubmit={false} taskMetadata={taskMetadata[0]}></TaskFormStep>,
            text: t('tabs.suitabilityForm'),
            index: 1,
            screenReaderLabel: t('tabs.suitabilityForm'),
        },
        {
            ariaLabel: t('tabs.summary'),
            isVisible: () => isReadyForDataEntry,
            component: (
                <TaskFormStep taskInfoLink={taskInfoLink} readonly={true} isSubmit={true} taskMetadata={taskMetadata[0]}></TaskFormStep>
            ),
            text: t('tabs.summary'),
            index: 2,
            screenReaderLabel: t('tabs.summary'),
        },
        {
            ariaLabel: t('tabs.nigoDetails'),
            isVisible: () => !isReadyForDataEntry,
            component: <NigoDetailsStep nigoExceptions={nigoExceptions} nigoSubExceptions={nigoSubExceptions} />,
            screenReaderLabel: t('tabs.nigoDetails'),
            index: 1,
            text: t('tabs.nigoDetails'),
        },
        {
            ariaLabel: t('tabs.confirm'),
            isVisible: () => true,
            component: <ConfirmStep taskType={taskType} taskInfoLink={taskInfoLink}></ConfirmStep>,
            text: t('tabs.confirm'),
            index: 3,
            screenReaderLabel: t('tabs.confirm'),
        },
    ];
    return steps;
};
