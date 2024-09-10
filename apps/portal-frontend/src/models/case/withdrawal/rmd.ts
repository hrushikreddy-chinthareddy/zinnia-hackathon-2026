export interface CalculateRmdResponse {
    rmdYear: string;
    mrdBasicValue: number;
    rmdAmount: number;
    tableId: number;
    primaryOwnerAge: number;
    jointOrSurvivorAge: number;
    effectiveDate: string;
    lifeExpectancy: number;
    status: Status;
}

export interface CalculateRmdErrorResponse {
    status: Status;
    rmdYear: string;
}

export interface Status {
    statusCode: StatusCode;
    statusMessage: string;
    errorMessage: null;
}

export interface CalculateRmdBody {
    rmdYear: string;
    mrdBasicValue: number; // If you pass as 0, you'll get the factor and can calculate on the front end.
}

export enum StatusCode {
    Success = 'Success',
    BadRequest = 'Bad Request',
    ServerError = 'Server Error',
}
