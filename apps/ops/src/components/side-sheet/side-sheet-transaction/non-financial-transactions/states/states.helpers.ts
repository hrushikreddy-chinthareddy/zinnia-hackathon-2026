import { Dispatch, SetStateAction } from 'react';

import { ValidationResult } from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';

interface HandleResponse {
    // TODO CB - better type
    response: any;
    setViewState: Dispatch<SetStateAction<ViewState>>;
    setValidationResults: Dispatch<SetStateAction<ValidationResult[]>>;
    setNewCaseId?: Dispatch<SetStateAction<string | undefined>>;
}

export enum ViewState {
    Alert = 'alert',
    BpmError = 'bpmError',
    Default = 'default',
    ApiError = 'error',
    Loading = 'loading',
    Success = 'success',
    Warn = 'warn',
}

export const handleResponse = ({
    response,
    setViewState,
    setValidationResults,
    setNewCaseId,
}: HandleResponse) => {
    switch (response?.status) {
        case StatusCode.Accepted:
            setViewState(ViewState.Success);
            break;
        case StatusCode.BadRequest:
            setValidationResults(response?.data?.validationResult);
            setViewState(ViewState.BpmError);
            break;
        case StatusCode.InternalServerError:
        default:
            setViewState(ViewState.ApiError);
            break;
    }
    if (response?.data?.caseId && setNewCaseId) {
        setNewCaseId(response?.data?.caseId);
    }
};
