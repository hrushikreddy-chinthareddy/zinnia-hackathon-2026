import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { TaskType } from '@deps/models/case/task';

export type GetStepsProps = {
    policyNumber: string;
    docType: string;
    clientCode: string;
    documentNumber: string;
    caseId: string;
    taskId: string;
    taskType: TaskType;
};

export interface GetSteps {
    (taskType: TaskType, props: GetStepsProps): Step[];
}

export interface FormConfigurationProvider {
    getSteps: GetSteps;
}
