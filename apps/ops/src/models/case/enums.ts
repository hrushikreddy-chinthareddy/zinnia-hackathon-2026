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
}

export enum TypeOfPayment {
    Fixed = 'Fixed',
    Variable = 'Variable',
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
    ExpectionCategory = 'expectionCategory',
    OpenStages = 'openStages',
    UpdatedAt = 'updatedAt',
    CreatedAt = 'createdAt',
    AgingRange = 'agingRange',
}
