import { TFunction } from 'next-i18next';

import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { TaskType } from '@deps/models/case/task';

export type GetStepsProps = {
    docType: string;
    carrierId: string;
    documentNumber: string;
    caseId: string;
    taskId: string;
    taskType: TaskType;
    isReadyForDataEntry: boolean;
    t: TFunction;
    nigoExceptions: any;
    nigoSubExceptions: any;
};

export interface GetSteps {
    (taskType: TaskType, props: GetStepsProps): Step[];
}

export interface FormStepsProvider {
    getSteps: GetSteps;
}
