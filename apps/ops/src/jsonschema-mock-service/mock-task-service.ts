import wellabeSuitabilityData from '@deps/jsonschema-mock-service/carrier/wellabe/suitability/suitability.json';
import wellabeSuitabilityReviewData from '@deps/jsonschema-mock-service/carrier/wellabe/suitability-review/suitability-review.json';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';

export const getTaskFormMetadataSSRMock = async (taskType: TaskType): Promise<FormMetadata | null> => {
    switch (taskType) {
        // todo:vijaya: need to fix metadata details
        // case TaskType.SuitabilityDataEntry:
        //     return wellabeSuitabilitySchema as FormMetadata;
        // case TaskType.SuitabilityReview:
        //     return wellabeSuitabilityReviewSchema as FormMetadata;
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
        default:
            return null;
    }
};
