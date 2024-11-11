import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';
import { TaskReviewStep } from '../components/steps/task-review/task-review-step';

export const getSuitabilitySteps = ({ policy, docType, clientCode, documentNumber, caseId, taskId, taskType, t }: GetStepsProps) => {
    const steps: Step[] = [
        {
            ariaLabel: t('tabs.taskReview'),
            component: (
                <TaskReviewStep
                    policyNumber={policy.policyNumber || ''}
                    docType={docType}
                    clientCode={clientCode}
                    taskInfoLink={''}
                    documentNumber={documentNumber}
                    document={undefined}
                    taskType={taskType}
                />
            ),
            text: t('tabs.start'),
            index: 0,
            isCompleted: true,
            screenReaderLabel: t('tabs.taskReview'),
        },
        {
            ariaLabel: t('tabs.suitabilityForm'),
            component: <TaskFormStep taskType={taskType} policy={policy} taskInfoLink={''} isSubmit={false}></TaskFormStep>,
            text: t('tabs.suitabilityForm'),
            index: 1,
            screenReaderLabel: t('tabs.suitabilityForm'),
        },
        {
            ariaLabel: t('tabs.summary'),
            component: <TaskFormStep taskType={taskType} policy={policy} taskInfoLink={''} readonly={true} isSubmit={true}></TaskFormStep>,
            text: t('tabs.summary'),
            index: 2,
            screenReaderLabel: t('tabs.summary'),
        },
        {
            ariaLabel: t('tabs.confirm'),
            component: <ConfirmStep caseId={caseId} taskId={taskId} taskType={taskType}></ConfirmStep>,
            text: t('tabs.confirm'),
            index: 3,
            screenReaderLabel: t('tabs.confirm'),
        },
    ];
    return steps;
};
