export type PanelHeights = {
    [key: number]: number;
};

export enum TabTitle {
    OwnerDetails = 'Owner Details',
    BeneficiaryDetails = 'Beneficiary Details',
    Signature = 'Signature',
}

export enum BeneficiaryRole {
    PRIMARYBENEFICIARY = 'Primary Beneficiary',
    CONTINGENTBENEFICIARY = 'Contingent Beneficiary',
    IRREVOCABLEBENEFICIARY = 'Irrevocable Beneficiary',
}

export enum Action {
    ADD = 'ADD',
    DELETE = 'DELETE',
    UPDATE = 'UPDATE',
    NONE = 'NONE',
}
