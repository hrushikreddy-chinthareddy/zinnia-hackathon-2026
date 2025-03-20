import { Dispatch, SetStateAction } from 'react';

import { ValidationResult } from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';

import { ViewState } from '../non-financial-transactions/states/states.helpers';

// TODO MG: share with non financial transactions (ViewState as well)
interface HandleResponse {
    // TODO CB - better type
    response: any;
    setViewState: Dispatch<SetStateAction<ViewState>>;
    setValidationResults: Dispatch<SetStateAction<ValidationResult[]>>;
}

export const handleResponse = ({ response, setViewState, setValidationResults }: HandleResponse) => {
    switch (response?.status) {
        case StatusCode.Accepted:
        case StatusCode.Okay:
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
};
