import { FormMetadata, TaskType } from '@deps/models/case/task';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
const DEFAULT_CARRIER = 'WELB';

export const getTaskFormMetadataSSRMock = async (
    clientId: string,
    taskType: TaskType
): Promise<FormMetadata | null> => {
    let carrier: string = DEFAULT_CARRIER;
    if (clientId) {
        carrier = clientId;
    }
    try {
        const schemaFileName = taskType.toLowerCase().replace(/_/g, '-');
        const schema = await import(
            `@deps/jsonschema-mock-service/tasks/${carrier}/${schemaFileName}.json`
        );
        return schema.default as unknown as FormMetadata;
    } catch (error) {
        console.warn(
            `No schema found for task type: ${taskType}. Returning default schema.`,
            error
        );
        return null; // Or return a default schema if applicable
    }
};

export const getCaseTaskByIdSSRMock = async (
    taskType: TaskType,
    clientId?: string
): Promise<ManagementTask<TaskStatus> | null> => {
    let carrier: string = DEFAULT_CARRIER;
    if (clientId) {
        carrier = clientId;
    }
    try {
        // Convert TaskType to a file name (e.g., "Agent_Nigo" -> "agent-nigo")
        const dataFileName = taskType.toLowerCase().replace(/_/g, '-');
        const taskData = await import(
            `@deps/jsonschema-mock-service/tasks-data/${carrier}/${dataFileName}.json`
        );
        return taskData.default as ManagementTask<TaskStatus>;
    } catch (error) {
        console.warn(`Task data not found for task type: ${taskType}`, error);
        return null; // Or return a default data if applicable
    }
};
