import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { TaskType } from '@deps/models/case/task';

import { getAgentNigoSteps } from './agent-nigo';
import { getAgentReviewSteps } from './agent-review';
import { getBeneAddressVerificationSteps } from './bene-address-verification';
import { getBeneCallSteps } from './bene-call-steps';
import { getClaimBeneReviewSteps } from './claim-bene-review-steps';
import { getClaimUncashTxnIdentifySteps } from './claim-uncash-txn-identify';
import { getDay150ReviewSteps } from './claims-day-150-review';
import { getClaimReverseUncashTxnSteps } from './claims-reverse-uncashed-transactions';
import { getClaimStopUncashTxnSteps } from './claims-stop-uncashed-transactions';
import getDefaultTaskSteps from './default-task-steps';
import { getMatchDocumentPaymentReviewSteps } from './match-payment-document-review';
import { getSuitabilityReviewSteps } from './suitability-review-steps';
import { getSuitabilitySteps } from './suitability-steps';
import { getTOANigoSteps } from './toa-nigo';
import { GetStepsProps } from './types';

export const getFormSteps = (
    taskType: TaskType,
    props: GetStepsProps
): Step[] => {
    let steps: Step[];
    switch (taskType) {
        case TaskType.SuitabilityDataEntry:
            steps = getSuitabilitySteps(props);
            break;
        case TaskType.SuitabilityReview:
            steps = getSuitabilityReviewSteps(props);
            break;

        case TaskType.PURCHASE_DOCUMENT_MATCHING:
        case TaskType.Standard_Document_Matching:
            steps = getMatchDocumentPaymentReviewSteps(props);
            break;
        case TaskType.Agent_Nigo:
        case TaskType.PremiumNigo:
        case TaskType.Application_Nigo:
        case TaskType.Attachment_Nigo:
        case TaskType.Review_Ofac:
        case TaskType.Agent_Onboarding_Nigo:
        case TaskType.Application_Review:
        case TaskType.AppDataEntry:
        case TaskType.Agent_Onboarding_Review:
        case TaskType.Suitaibility_DataEntry_Nigo_Review:
        case TaskType.ReturnPayment:
        case TaskType.Send_Nigo_Communication:
        case TaskType.Initiate_Postissue_Transaction:
        case TaskType.Payment_Follow_Up:
        case TaskType.Background_Nigo:
        case TaskType.Background_Review:
        case TaskType.Purchase_enrichment:
        case TaskType.Duplicate_Review:
        case TaskType.Cost_Basis_Review:
        case TaskType.Claims_Match_Bene_Document:
        case TaskType.Claims_Fi_Escheatment_Task:
        case TaskType.Policyupdate_Partydetails_Review:
            steps = getAgentNigoSteps(props);
            break;

        case TaskType.Agent_Review:
            steps = getAgentReviewSteps(props);
            break;
        case TaskType.TOA_Nigo:
        case TaskType.Prenote_Nigo:
        case TaskType.TOA_Review:
        case TaskType.Prenote_Review:
        case TaskType.Payment_Processing_Review:
        case TaskType.Ops_Nigo:
        case TaskType.Ops_Review:
            steps = getTOANigoSteps(props);
            break;
        case TaskType.Claims_Identify_Uncashed_Transactions:
            steps = getClaimUncashTxnIdentifySteps(props);
            break;
        case TaskType.Claims_Stop_Uncashed_Transactions:
            steps = getClaimStopUncashTxnSteps(props);
            break;
        case TaskType.Claims_Reverse_Uncashed_Transactions:
            steps = getClaimReverseUncashTxnSteps(props);
            break;
        case TaskType.Bene_Address_Verification:
            steps = getBeneAddressVerificationSteps(props);
            break;
        case TaskType.Claims_Bene_Review:
            steps = getClaimBeneReviewSteps(props);
            break;
        case TaskType.Bene_Call:
            steps = getBeneCallSteps(props);
            break;
        case TaskType.Day_150_Review:
            steps = getDay150ReviewSteps(props);
            break;
        default:
            steps = getDefaultTaskSteps(props);
            break;
    }
    return steps;
};
