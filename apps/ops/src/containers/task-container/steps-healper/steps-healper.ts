import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { TaskType } from '@deps/models/case/task';

import { getSuitabilityReviewSteps } from './suitability-review-steps';
import { getSuitabilitySteps } from './suitability-steps';
import { GetStepsProps } from './types';

export const getFormSteps = (taskType: TaskType, props: GetStepsProps): Step[] => {
    let steps: Step[];
    switch (taskType) {
        case TaskType.Suitability:
            steps = getSuitabilitySteps(props);
            break;
        case TaskType.SuitabilityReview:
            steps = getSuitabilityReviewSteps(props);
            break;
        default:
            steps = [];
    }
    return steps;
};
