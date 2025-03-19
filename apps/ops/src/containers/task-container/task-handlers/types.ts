import { LoggingContext } from '@deps/utils/server-logging';

export interface ApiFunction<RequestPayload, ResponseData> {
    (payload: RequestPayload, accessToken: string, logCtx: LoggingContext): Promise<ResponseData | null>;
}

export interface TaskHandler<RequestPayload, ResponseData> {
    api: ApiFunction<RequestPayload, ResponseData>;
    getPayload: (task: any) => RequestPayload;
    transformResponse: (response: ResponseData, metadata: any) => void;
}
