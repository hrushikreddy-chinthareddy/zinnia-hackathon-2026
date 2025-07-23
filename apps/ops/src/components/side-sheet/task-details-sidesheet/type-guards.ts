import { ClaimNextTask } from '@deps/queries/api/v1/claim-task';

export function isClaimNextTask(response: any): response is ClaimNextTask {
    return typeof response?.id === 'string';
}

export function isAPIErrorInformation(response: any): response is RequestData {
    return (
        typeof response?.statusCode === 'number' ||
        typeof response?.status === 'number'
    );
}

export type RequestData = {
    statusCode?: number;
    timestamp?: string;
    errorId?: string;
    message: string;
};
