export type PanelHeights = {
    [key: number]: number;
};

export enum TabTitle {
    OwnerDetails = 'Owner Details',
    BeneficiaryDetails = 'Beneficiary Details',
    Signature = 'Signature',
}

export enum BeneficiaryRole {
    OWNER = 'Owner',
    JOINTOWNER = 'Joint Owner',
    PRIMARYBENEFICIARY = 'Primary Beneficiary',
    CONTINGENTBENEFICIARY = 'Contingent Beneficiary',
    IRREVOCABLEBENEFICIARY = 'Irrevocable Beneficiary',
}
