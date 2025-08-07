import { FormMetadata } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import { LoggingContext } from '@deps/utils/server-logging';

export interface ApiFunction<RequestPayload, ResponseData> {
    (
        payload: RequestPayload,
        accessToken: string,
        logCtx: LoggingContext
    ): Promise<ResponseData | null>;
}

export interface TaskHandler<RequestPayload, ResponseData> {
    api: ApiFunction<RequestPayload, ResponseData>;
    getPayload: (task: any) => RequestPayload;
    transformResponse: (
        response: ResponseData,
        metadata: FormMetadata[],
        task?: ManagementTask
    ) => void;
}

export interface ReviewPayload {
    category: string[];
    businessProcess: string;
    carrier?: string;
}
