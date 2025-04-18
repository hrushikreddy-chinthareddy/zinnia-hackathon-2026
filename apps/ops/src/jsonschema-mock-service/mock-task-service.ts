import wellabeSuitabilitySchema from '@deps/jsonschema-mock-service/carrier/wellabe/suitability/suitability-schema.json';
import wellabeSuitabilityData from '@deps/jsonschema-mock-service/carrier/wellabe/suitability/suitability.json';
import wellabeSuitabilityReviewSchema from '@deps/jsonschema-mock-service/carrier/wellabe/suitability-review/suitability-review-schema.json';
import wellabeSuitabilityReviewData from '@deps/jsonschema-mock-service/carrier/wellabe/suitability-review/suitability-review.json';
import agentNigoSchema from '@deps/jsonschema-mock-service/tasks/agent-nigo.json';
import agentOnboardingNigoSchema from '@deps/jsonschema-mock-service/tasks/agent-onboarding-nigo.json';
import agentOnboardingReviewSchema from '@deps/jsonschema-mock-service/tasks/agent-onboarding-review.json';
import agentReviewSchema from '@deps/jsonschema-mock-service/tasks/agent-review.json';
import applicationNigoSchema from '@deps/jsonschema-mock-service/tasks/application-nigo.json';
import attachmentNigoSchema from '@deps/jsonschema-mock-service/tasks/attachment-nigo.json';
import appDataEntrySchema from '@deps/jsonschema-mock-service/tasks/nb_app_data_entry.json';
import premiumNigoSchema from '@deps/jsonschema-mock-service/tasks/premium-nigo.json';
import prenoteNigoSchema from '@deps/jsonschema-mock-service/tasks/prenote-nigo.json';
import prenoteReviewSchema from '@deps/jsonschema-mock-service/tasks/prenote-review.json';
import purchaseDocumentMatchingSchema from '@deps/jsonschema-mock-service/tasks/purchase-document-matching.json';
import returnPaymentSchema from '@deps/jsonschema-mock-service/tasks/return-payment.json';
import ofacReviewSchema from '@deps/jsonschema-mock-service/tasks/review-ofac.json';
import standardDocumentMatchingSchema from '@deps/jsonschema-mock-service/tasks/standard-document-matching.json';
import toaNigoSchema from '@deps/jsonschema-mock-service/tasks/toa-nigo.json';
import toaReviewSchema from '@deps/jsonschema-mock-service/tasks/toa-review.json';
import agentNigoData from '@deps/jsonschema-mock-service/tasks-data/agent-nigo.json';
import agentOnboardingNigoData from '@deps/jsonschema-mock-service/tasks-data/agent-onboarding-nigo.json';
import agentOnboardingReviewData from '@deps/jsonschema-mock-service/tasks-data/agent-onboarding-review.json';
import agentReviewData from '@deps/jsonschema-mock-service/tasks-data/agent-review.json';
import appDataEnteyData from '@deps/jsonschema-mock-service/tasks-data/app-data-entry.json';
import applicationNigoData from '@deps/jsonschema-mock-service/tasks-data/application-nigo.json';
import attachmentNigoData from '@deps/jsonschema-mock-service/tasks-data/attachment-nigo.json';
import initiatePostissueTransactionData from '@deps/jsonschema-mock-service/tasks-data/initiate-postissue-transaction.json';
import ofacReviewData from '@deps/jsonschema-mock-service/tasks-data/ofac-review.json';
import premiumNigoData from '@deps/jsonschema-mock-service/tasks-data/premium-nigo.json';
import prenoteNigoData from '@deps/jsonschema-mock-service/tasks-data/prenote-nigo.json';
import prenoteReviewData from '@deps/jsonschema-mock-service/tasks-data/prenote-review.json';
import purchaseDocumentMatchingData from '@deps/jsonschema-mock-service/tasks-data/purchase-document-matching.json';
import returnPaymentData from '@deps/jsonschema-mock-service/tasks-data/return-payment.json';
import sendNigoCommunicationData from '@deps/jsonschema-mock-service/tasks-data/send-communication-nigo.json';
import standardDocumentMatchingData from '@deps/jsonschema-mock-service/tasks-data/standard-document-matching.json';
import toaNigoData from '@deps/jsonschema-mock-service/tasks-data/toa-nigo.json';
import toaReviewData from '@deps/jsonschema-mock-service/tasks-data/toa-review.json';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';

export const getTaskFormMetadataSSRMock = async (taskType: TaskType): Promise<FormMetadata | null> => {
    switch (taskType) {
        case TaskType.SuitabilityDataEntry:
            return wellabeSuitabilitySchema as unknown as FormMetadata;
        case TaskType.SuitabilityReview:
            return wellabeSuitabilityReviewSchema as unknown as FormMetadata;
        case TaskType.PURCHASE_DOCUMENT_MATCHING:
            return purchaseDocumentMatchingSchema as unknown as FormMetadata;
        case TaskType.Agent_Nigo:
            return agentNigoSchema as unknown as FormMetadata;
        case TaskType.Application_Nigo:
            return applicationNigoSchema as unknown as FormMetadata;
        case TaskType.PremiumNigo:
            return premiumNigoSchema as unknown as FormMetadata;
        case TaskType.Standard_Document_Matching:
            return standardDocumentMatchingSchema as unknown as FormMetadata;
        case TaskType.TOA_Nigo:
            return toaNigoSchema as unknown as FormMetadata;
        case TaskType.Agent_Onboarding_Nigo:
            return agentOnboardingNigoSchema as unknown as FormMetadata;
        case TaskType.Attachment_Nigo:
            return attachmentNigoSchema as unknown as FormMetadata;
        case TaskType.Agent_Review:
            return agentReviewSchema as unknown as FormMetadata;
        case TaskType.AppDataEntry:
            return appDataEntrySchema as unknown as FormMetadata;
        case TaskType.Agent_Onboarding_Review:
            return agentOnboardingReviewSchema as unknown as FormMetadata;
        case TaskType.Review_Ofac:
            return ofacReviewSchema as unknown as FormMetadata;
        case TaskType.Prenote_Nigo:
            return prenoteNigoSchema as unknown as FormMetadata;
        case TaskType.TOA_Review:
            return toaReviewSchema as unknown as FormMetadata;
        case TaskType.Prenote_Review:
            return prenoteReviewSchema as unknown as FormMetadata;
        case TaskType.Payment_Processing_Review:
            return prenoteReviewSchema as unknown as FormMetadata;
        case TaskType.ReturnPayment:
            return returnPaymentSchema as unknown as FormMetadata;
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
        case TaskType.ReturnPayment:
            return returnPaymentData as ManagementTask<TaskStatus>;
        case TaskType.Review_Ofac:
            return ofacReviewData as ManagementTask<TaskStatus>;
        case TaskType.Prenote_Nigo:
            return prenoteNigoData as ManagementTask<TaskStatus>;
        case TaskType.Send_Nigo_Communication:
            return sendNigoCommunicationData as ManagementTask<TaskStatus>;
        case TaskType.Initiate_Postissue_Transaction:
            return initiatePostissueTransactionData as ManagementTask<TaskStatus>;
        case TaskType.TOA_Review:
            return toaReviewData as ManagementTask<TaskStatus>;
        case TaskType.Prenote_Review:
            return prenoteReviewData as ManagementTask<TaskStatus>;
        case TaskType.Payment_Processing_Review:
            return prenoteReviewData as ManagementTask<TaskStatus>; //change when proper task is there for payment processing
        default:
            return null;
    }
};
