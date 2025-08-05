export enum SignatureValidationType {
    Owner = 'owner',
    Employer = 'employer',
    Trustee = 'trustee',
    PlanAdmin = 'planAdmin',
    JointOwner = 'jointOwner',
    Joint = 'Joint',
}

export enum SignPresent {
    No = 'No',
    Unselected = 'Unselected',
    Yes = 'Yes',
}

export enum DesignationPresent {
    No = 'No',
    Unselected = 'Unselected',
    Yes = 'Yes',
}

export enum SignValidated {
    No = 'No',
    Unselected = 'Unselected',
    Yes = 'Yes',
}

export type SignatureValidation = {
    date: string;
    printedName: string | undefined;
    signPresent: SignPresent;
    type?: SignatureValidationType;
};

export enum SignatureValidationTypeWithdrawal {
    Owner = 'Owner',
    JointOwner = 'Joint Owner',
    IrrevocableBeneficiary = 'Irrevocable Beneficiary',
    Spouse = 'Spouse',
    FinancialProfessional = 'Financial Professional',
    Annuitant = 'Annuitant',
    Notary = 'Notary',
    OwnerNotaryStamp = 'Owner Notary Stamp',
    JointOwnerNotaryStamp = 'Joint Owner Notary Stamp',
    SpouseNotaryStamp = 'Spouse Notary Stamp',
    Witness = 'Witness',
}

export enum ESignatureValidationTypeWithdrawal {
    Owner = 'Owner',
    JointOwner = 'Joint Owner',
}

export enum SignatureDesignation {
    Trustee = 'Trustee',
    Executor = 'Executor',
    Custodian = 'Custodian',
    Guardian = 'Guardian',
    AttorneyInFact = 'Attorney-in-fact',
    Assignee = 'Assignee',
    NA = 'NA',
    Unselected = 'Unselected',
}
