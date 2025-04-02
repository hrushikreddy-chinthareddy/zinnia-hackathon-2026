import { TaskType } from '@deps/models/case/task';

export const allowedTaskTypes = new Set<TaskType>([
    TaskType.Agent_Review,
    TaskType.PURCHASE_DOCUMENT_MATCHING,
    TaskType.Standard_Document_Matching,
    TaskType.Review_Ofac,
    TaskType.Agent_Onboarding_Review,
    TaskType.TOA_Review,
    TaskType.Prenote_Review,
    TaskType.Payment_Processing_Review,
    TaskType.Application_Review,
    TaskType.Agent_Onboarding_Review
]);
