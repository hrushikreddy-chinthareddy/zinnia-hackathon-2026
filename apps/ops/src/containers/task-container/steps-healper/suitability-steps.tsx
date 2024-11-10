import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';
import { TaskReviewStep } from '../components/steps/task-review/task-review-step';

export const getSuitabilitySteps = ({ policy, docType, clientCode, documentNumber, caseId, taskId, taskType }: GetStepsProps) => {
    const steps: Step[] = [
        {
            ariaLabel: 'Input Suitability Data',
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
            text: 'Start',
            index: 0,
            isCompleted: true,
            screenReaderLabel: 'Input Suitability Data',
        },
        {
            ariaLabel: 'Suitability form',
            component: <TaskFormStep taskType={taskType} policy={policy} taskInfoLink={''} isSubmit={false}></TaskFormStep>,
            text: 'Suitability Form',
            index: 1,
            screenReaderLabel: 'Suitability form',
        },
        {
            ariaLabel: 'Summary',
            component: <TaskFormStep taskType={taskType} policy={policy} taskInfoLink={''} readonly={true} isSubmit={true}></TaskFormStep>,
            text: 'Summary',
            index: 2,
            screenReaderLabel: 'Summary',
        },
        {
            ariaLabel: 'Confirm',
            component: <ConfirmStep caseId={caseId} taskId={taskId} taskType={taskType}></ConfirmStep>,
            text: 'Confirm',
            index: 3,
            screenReaderLabel: 'Confirm',
        },
    ];
    return steps;
};
