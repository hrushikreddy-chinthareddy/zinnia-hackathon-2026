import { TaskType } from '@deps/models/case/task';

export const allowedTaskTypes = new Set<TaskType>([
    TaskType.Agent_Review,
    TaskType.PURCHASE_DOCUMENT_MATCHING,
    TaskType.Standard_Document_Matching,
    TaskType.Review_Ofac,
    TaskType.Application_Review,
    TaskType.Agent_Onboarding_Review
]);
