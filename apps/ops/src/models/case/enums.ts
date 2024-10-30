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

export enum SswUpdateOption {
    SSW_UPDATE = 'SSW Update',
    BANK_UPDATE = 'Bank Update',
    RMD_UPDATE = 'RMD Update',
    EFT_DRAW_UPDATE = 'EFT Draw Update',
    NEW = 'New',
}
