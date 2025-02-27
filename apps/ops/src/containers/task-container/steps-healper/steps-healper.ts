import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { TaskType } from '@deps/models/case/task';

import { getAgentNigoSteps } from './agent-nigo';
import { getAgentReviewSteps } from './agent-review';
import { getMatchDocumentPaymentReviewSteps } from './match-payment-document-review';
import { getSuitabilityReviewSteps } from './suitability-review-steps';
import { getSuitabilitySteps } from './suitability-steps';
import { GetStepsProps } from './types';

export const getFormSteps = (taskType: TaskType, props: GetStepsProps): Step[] => {
    let steps: Step[];
    switch (taskType) {
        case TaskType.SuitabilityDataEntry:
            steps = getSuitabilitySteps(props);
            break;
        case TaskType.SuitabilityReview:
            steps = getSuitabilityReviewSteps(props);
            break;

        case TaskType.PURCHASE_DOCUMENT_MATCHING:
            steps = getMatchDocumentPaymentReviewSteps(props);
            break;
        case TaskType.Agent_Nigo:
        case TaskType.PremiumNigo:
            steps = getAgentNigoSteps(props);
            break;
        case TaskType.Attachment_Nigo:
            steps = getAgentNigoSteps(props);
            break;

        case TaskType.Application_Nigo:
            steps = getAgentNigoSteps(props);
            break;
        case TaskType.Agent_Review:
            steps = getAgentReviewSteps(props);
            break;
        default:
            steps = [];
    }
    return steps;
};
