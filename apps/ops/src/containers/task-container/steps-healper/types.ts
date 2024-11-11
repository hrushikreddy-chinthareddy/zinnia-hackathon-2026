import { TFunction } from 'next-i18next';

import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { TaskType } from '@deps/models/case/task';
import { Policy } from '@deps/models/policy/sor-policy';

export type GetStepsProps = {
    policy: Policy;
    docType: string;
    clientCode: string;
    documentNumber: string;
    caseId: string;
    taskId: string;
    taskType: TaskType;
    t: TFunction;
};

export interface GetSteps {
    (taskType: TaskType, props: GetStepsProps): Step[];
}

export interface FormStepsProvider {
    getSteps: GetSteps;
}
