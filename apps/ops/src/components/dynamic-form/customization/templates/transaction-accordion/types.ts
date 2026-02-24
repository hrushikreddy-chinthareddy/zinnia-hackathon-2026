export type PanelHeights = {
    [key: number]: number;
};

export enum TabTitle {
    OwnerDetails = 'Owner Details',
    BeneficiaryDetails = 'Beneficiary Details',
    Signature = 'Signature',
    AssigneeDetails = 'Assignee Details',
    ReviewFormData = 'Review Form Data',
    FormReview = 'Form Review',
    NIGOSummary = 'NIGO Summary',
    Summary = 'Summary',
}

export enum BeneficiaryRole {
    OWNER = 'Owner',
    JOINTOWNER = 'Joint Owner',
    PRIMARYBENEFICIARY = 'Primary Beneficiary',
    CONTINGENTBENEFICIARY = 'Contingent Beneficiary',
    IRREVOCABLEBENEFICIARY = 'Irrevocable Beneficiary',
}
