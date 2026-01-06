import { TFunction } from 'next-i18next';

import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { FormMetadata, TaskType } from '@deps/models/case/task';

export type GetStepsProps = {
    carrierId: string;
    caseId: string;
    taskId: string;
    taskType: TaskType;
    taskInfoLink: string;
    isReadyForDataEntry: boolean;
    t: TFunction;
    nigoExceptions: any;
    nigoSubExceptions: any;
    taskMetadata: FormMetadata[];
    task?: any;
    isSaveAsDraftEnabled: boolean;
    isContinueButtonEnabled: boolean;
};

export interface GetSteps {
    (taskType: TaskType, props: GetStepsProps): Step[];
}

export interface FormStepsProvider {
    getSteps: GetSteps;
}
