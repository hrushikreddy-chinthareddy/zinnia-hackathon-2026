import wellabeSuitabilitySchema from '@deps/jsonschema-mock-service/carrier/wellabe/suitability/suitability-schema.json';
import wellabeSuitabilityData from '@deps/jsonschema-mock-service/carrier/wellabe/suitability/suitability.json';
import wellabeSuitabilityReviewSchema from '@deps/jsonschema-mock-service/carrier/wellabe/suitability-review/suitability-review-schema.json';
import wellabeSuitabilityReviewData from '@deps/jsonschema-mock-service/carrier/wellabe/suitability-review/suitability-review.json';
import agentNigoData from '@deps/jsonschema-mock-service/tasks-data/agent-nigo.json';
import agentOnboardingNigoData from '@deps/jsonschema-mock-service/tasks-data/agent-onboarding-nigo.json';
import agentOnboardingReviewData from '@deps/jsonschema-mock-service/tasks-data/agent-onboarding-review.json';
import appDataEnteyData from '@deps/jsonschema-mock-service/tasks-data/agent-onboarding-review.json';
import agentReviewData from '@deps/jsonschema-mock-service/tasks-data/agent-review.json';
import applicationNigoData from '@deps/jsonschema-mock-service/tasks-data/application-nigo.json';
import attachmentNigoData from '@deps/jsonschema-mock-service/tasks-data/attachment-nigo.json';
import premiumNigoData from '@deps/jsonschema-mock-service/tasks-data/premium-nigo.json';
import purchaseDocumentMatchingData from '@deps/jsonschema-mock-service/tasks-data/purchase-document-matching.json';
import standardDocumentMatchingData from '@deps/jsonschema-mock-service/tasks-data/standard-document-matching.json';
import toaNigoData from '@deps/jsonschema-mock-service/tasks-data/toa-nigo.json';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';

export const getTaskFormMetadataSSRMock = async (taskType: TaskType): Promise<FormMetadata | null> => {
    switch (taskType) {
        case TaskType.SuitabilityDataEntry:
            return wellabeSuitabilitySchema as unknown as FormMetadata;
        case TaskType.SuitabilityReview:
            return wellabeSuitabilityReviewSchema as unknown as FormMetadata;
        default:
            return null;
    }
};

export const getCaseTaskByIdSSRMock = async (taskType: TaskType): Promise<ManagementTask<TaskStatus> | null> => {
    switch (taskType) {
        case TaskType.SuitabilityDataEntry:
            return wellabeSuitabilityData as ManagementTask<TaskStatus>;
        case TaskType.SuitabilityReview:
            return wellabeSuitabilityReviewData as ManagementTask<TaskStatus>;
        case TaskType.PURCHASE_DOCUMENT_MATCHING:
            return purchaseDocumentMatchingData as ManagementTask<TaskStatus>;
        case TaskType.Agent_Nigo:
            return agentNigoData as ManagementTask<TaskStatus>;
        case TaskType.Application_Nigo:
            return applicationNigoData as ManagementTask<TaskStatus>;
        case TaskType.PremiumNigo:
            return premiumNigoData as ManagementTask<TaskStatus>;
        case TaskType.Standard_Document_Matching:
            return standardDocumentMatchingData as ManagementTask<TaskStatus>;
        case TaskType.TOA_Nigo:
            return toaNigoData as ManagementTask<TaskStatus>;
        case TaskType.Agent_Onboarding_Nigo:
            return agentOnboardingNigoData as ManagementTask<TaskStatus>;
        case TaskType.Attachment_Nigo:
            return attachmentNigoData as ManagementTask<TaskStatus>;
        case TaskType.Agent_Review:
            return agentReviewData as ManagementTask<TaskStatus>;
        case TaskType.AppDataEntry:
            return appDataEnteyData as ManagementTask<TaskStatus>;
        case TaskType.Agent_Onboarding_Review:
            return agentOnboardingReviewData as ManagementTask<TaskStatus>;
        default:
            return null;
    }
};
