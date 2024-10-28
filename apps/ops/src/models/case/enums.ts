export enum ApiVersion {
    v1,
    v2,
}

export enum ProcessType {
    OFT = 'OFT',
    SSW = 'SSW',
    WITHDRAWAL = 'WITHDRAWAL',
    ADDRESS_CHANGE = 'ADDRESS_CHANGE',
    REREG = 'REREG',
}

export enum TypeOfPayment {
    Fixed = 'Fixed',
    Variable = 'Variable',
}

export enum ContributionType {
    Contribution = 'Contribution',
    Loan = 'Loan Repayment',
    Disbursement = 'Disbursement',
}

export enum ChannelType {
    Phone = 'PHONE',
    Email = 'EMAIL',
}
