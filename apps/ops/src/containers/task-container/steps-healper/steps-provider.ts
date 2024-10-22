import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { TaskType } from '@deps/models/case/task';

import { getFormSteps } from './steps-healper';
import { FormConfigurationProvider, GetStepsProps } from './types';

export class StepsProvider implements FormConfigurationProvider {
    getSteps: (taskType: TaskType, props: GetStepsProps) => Step[];

    constructor() {
        this.getSteps = getFormSteps;
    }
}

export const stepsProvider = new StepsProvider();
