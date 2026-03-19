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
    SUITABILITY = 'Suitability',
    DEFAULT_CASE = 'Operations Review',
    IDN_DEATH_CLAIM = 'IDN_DEATH_CLAIM',
    RMD = 'RMD',
    PolicyUpdate = 'Policy Update',
}

export enum TypeOfPayment {
    Fixed = 'Fixed',
    Variable = 'Variable',
}

export enum SswUpdateOption {
    SSW_UPDATE = 'SSW Update',
    BANK_UPDATE = 'Bank Update',
    RMD_UPDATE = 'RMD Update',
    EFT_DRAW_UPDATE = 'EFT Draw Update',
    NEW = 'New',
    WITHHOLDING_UPDATE = 'Withholding Update',
    PROGRAM_TERMINATE = 'ProgramTerminate',
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

export enum BankUpdateType {
    BankUpdate = 'BankUpdate',
    BankTerminate = 'BankTerminate',
}
export enum GroupByOptions {
    /**
     * [WARNING!] Only use when creating generic types, do not use for filtering in the API
     */
    Default = 'default',
    /**
     * [Custom] as of 11/2 this was NOT supported by the case management team. Adding here for future usage
     * and the custom implmentation used in the active-aging.tsx.
     */
    AgingTimeRanges = 'agingTimeRanges',
    BrokerDealerName = 'brokerDealerName',
    Carrier = 'carrier',
    CaseStatus = 'caseStatus',
    ProcessSubType = 'processSubType',
    PolicyNumber = 'policyNumber',
    Process = 'process',
    ProductName = 'productName',
    ExceptionCategory = 'exceptionCategory',
    OpenStages = 'openStages',
    UpdatedAt = 'updatedAt',
    CreatedAt = 'createdAt',
    AgingRange = 'agingRange',
    ApplicationType = 'applicationType',
}

export enum SpecialProgramType {
    SSW = 'SSW',
    RMD = 'RMD',
    EFT = 'EFT',
}

export enum PendingReasonOptions {
    AwaitingAdditionalInformation = 'Awaiting additional information',
    AwaitingApproval = 'Awaiting approval',
    AwaitingApplication = 'Awaiting application',
    SupportTicketRaised = 'Support Ticket Raised',
}

export enum RmdFormType {
    RMD = 'RMD',
    QCD = 'QCD',
}

export enum CaseSource {
    ZinniaLive = 'Zinnia Live',
    MyPolicyView = 'My Policy View',
    FarmersNewWorldLifeInsurance = "Farmer's New World Life Insurance",
    DeathAudit = 'Death Audit',
}

export enum CaseAction {
    Prioritize = 'prioritize',
    Deprioritize = 'deprioritize',
}
