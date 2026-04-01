import type { FullRjsfOutput } from './pipeline-types';

export const TASK_CONTAINER_PREVIEW_STORAGE_KEY =
    'transaction-builder.task-container-preview';

export type TaskContainerPreviewPayload = {
    fullRjsfOutput: FullRjsfOutput;
    createdAt: string;
};
