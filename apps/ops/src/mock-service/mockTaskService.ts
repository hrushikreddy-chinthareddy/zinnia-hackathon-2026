import wellabeSuitabilitySchema from '@deps/mock-service/carrier/wellabe/suitability/suitability-schema.json';
import wellabeSuitabilityData from '@deps/mock-service/carrier/wellabe/suitability/suitability.json';
import { FormMetadata } from '@deps/models/case/task';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';

export const getTaskFormMetadataSSRMock = async (): Promise<FormMetadata | null> => {
    return wellabeSuitabilitySchema as FormMetadata;
};

export const getCaseTaskByIdSSRMock = async (): Promise<ManagementTask<TaskStatus> | null> => {
    return wellabeSuitabilityData as ManagementTask<TaskStatus>;
};
