export interface CalculateRmdResponse {
    items: {
        calculatedValues: [
            {
                taxYear: number;
                rmdRequiredForTaxYear: boolean;
                isFirstRMD: boolean | null;
                rmdBasis: number;
                rmdAmount: number | null;
                dueDate: string | null;
                duration: number | null;
            }
        ];
        policyValues: [
            {
                taxYear: number;
                rmdBasis: number;
            }
        ];
    };
    correlationId: string;
    message: string;
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
    policy: {
        policyNumber: string;
        QualificationType: RmdQualTypes;
        policyStatus: string;
        policyValues: [
            {
                taxYear: number;
                rmdBasis: number;
            }
        ];
        parties: RmdParty[];
    };
}

export type RmdParty = {
    partyRole: string; // INSURED / PRIMARYBENEFICARY
    partyType: string; // INDIVIDUAL
    fullName: string; // Full Name
    relationshipToInsured?: string; // relationship / INDIVIDUAL/SPOUSE/HUSBAND/WIFE
    dateOfBirth: string; // dob 1950-01-01
};

export enum StatusCode {
    Success = 'Success',
    BadRequest = 'Bad Request',
    ServerError = 'Server Error',
}

export enum VariableQuoteDescription {
    FreeWithdrawalAmount = 'FreeWithdrawalAmount',
    AccruedIntOnFixedAcct = 'AccruedIntOnFixedAcct',
    MVAAdjustment = 'MVAAdjustment',
    MRDBasis = 'MRDBasis',
    IntAccruedFromLastAnniv = 'IntAccruedFromLastAnniv',
    IntAccruedFromInitialCont = 'IntAccruedFromInitialCont',
    AnnualCharge = 'AnnualCharge',
    PremiumBonus = 'PremiumBonus',
    StratFee = 'StratFee',
    RiderFee = 'RiderFee',
    AdminFee = 'AdminFee',
}

export type VariableQuoteResponse = {
    status: {
        statusCode: StatusCode;
        statusMessage: string;
        errors: [];
    };
    valuationDate: string;
    variableFilter: string;
    variableQuoteArray: {
        variableType: number;
        variableId: string;
        variableDescription: VariableQuoteDescription;
        variableValue: string;
    }[];
};

export enum RmdQualTypes {
    Qualified = 'Qualified',
    NonQualified = 'Non-Qualified',
}

export enum RmdRoles {
    Insured = 'INSURED',
    PrimaryBeneficiary = 'PRIMARYBENEFICARY',
}
