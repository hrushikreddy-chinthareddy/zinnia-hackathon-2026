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
    TaskType.Agent_Onboarding_Review,
    TaskType.Background_Review,
    TaskType.Default_Case_DataEntry,
    TaskType.Claims_Identify_Uncashed_Transactions,
    TaskType.Claims_Stop_Uncashed_Transactions,
    TaskType.Claims_Reverse_Uncashed_Transactions,
    TaskType.Background_Review,
    TaskType.Payment_Follow_Up,
]);
