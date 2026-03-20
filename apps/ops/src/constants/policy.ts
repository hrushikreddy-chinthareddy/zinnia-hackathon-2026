import clsx from 'clsx';

export enum HttpMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
    PATCH = 'patch',
}

export enum Roles {
    OWNER = 'OWNER',
    NEWOWNER = 'NEWOWNER',
    JOINTOWNER = 'JOINTOWNER',
    NEWJOINTOWNER = 'NEWJOINTOWNER',
    JOINT_OWNER = 'JOINT_OWNER',
    NEWJOINT_OWNER = 'NEWJOINT_OWNER',
    IRREVOCABLE = 'IRREVOCABLE',
    PRIMARYBENEFICIARY = 'PRIMARYBENEFICIARY',
    CONTINGENTBENEFICIARY = 'CONTINGENTBENEFICIARY',
    PAYOR = 'PAYOR',
    NEWPAYOR = 'NEWPAYOR',
    THIRDPARTYDESIGNEE = 'THIRDPARTYDESIGNEE',
    NEWTHIRDPARTYDESIGNEE = 'NEWTHIRDPARTYDESIGNEE',
    ASSIGNEE = 'ASSIGNEE',
    IRREVOCABLE_BENEFICIARY = 'IRREVOCABLE_BENEFICIARY',
}

export enum RoleLabel {
    OWNER = 'Owner',
    JOINTOWNER = 'Joint Owner',
    PAYOR = 'Payor',
    THIRDPARTYDESIGNEE = 'Third Party Designee',
    IRREVOCABLE_BENEFICIARY = 'Irrevocable Beneficiary',
    ASSIGNEE = 'Assignee',
}

export enum PolicyRole {
    OWNER = 'Owner',
    JOINTOWNER = 'JointOwner',
    PAYOR = 'Payor',
    THIRDPARTYDESIGNEE = 'ThirdPartyDesignee',
    BENEFICIARY = 'Beneficiary',
    ASSIGNEE = 'Assignee',
    ANNUITANT = 'Annuitant',
    AGENT = 'multi-agent',
}

export enum BooleanValue {
    'Yes' = 'Yes',
    'No' = 'No',
}

export enum TagType {
    Add = 'ADD',
    Delete = 'DELETE',
    None = 'None',
}

export const containerClasses = clsx(
    'flex ',
    'rounded border-2 border-gray-100',
    'my-3 bg-gray-50'
);

export const sectionClasses = 'flex flex-col p-4 md:p-6 lg:p-8';

export const fullcontainerClasses = clsx(
    'flex flex-col',
    'rounded border-2 border-gray-100',
    'my-3 bg-gray-50'
);

export enum ActionType {
    Add = 'Add',
    Remove = 'Remove',
}

export enum ReasonValue {
    OwnerDeath = 'Death of Owner',
    GiftTransfer = 'Gift Transfer',
    TransferConsideration = 'Transfer for Consideration',
}

export enum NewTrustType {
    Corporate = 'CORPORATETRUST',
    Individual = 'INDIVIDUALTRUST',
    Testamentary = 'TESTAMENTARYTRUST',
    InterVivos = 'INTERVIVOSTRUST',
    Grantor = 'GRANTORTRUST',
}

export enum SourceType {
    Case = 'case',
    Document = 'document',
}

export const FormatPatterns = {
    ZIP_CODE: '#####-####',
    PHONE: '(###) ###-####',
    EXTENSION: '(###)',
    SSN: '###-##-####',
    DATE: '##/##/####',
};

export enum AddressField {
    Addresses = 'addresses',
    AddressType = 'addressType',
    AddressLine1 = 'addressLine1',
    AddressLine2 = 'addressLine2',
    AddressLine3 = 'addressLine3',
    City = 'city',
    State = 'state',
    ZipCode = 'zipCode',
    ZipCodeExtension = 'zipCodeExtension',
    Country = 'country',
    Remove = 'remove',
    PreferredAddress = 'preferredAddress',
}

export enum PhoneField {
    Phones = 'phones',
    PhoneType = 'phoneType',
    PhoneNumber = 'phoneNumber',
    Remove = 'remove',
    AreaCode = 'areaCode',
    CountryCode = 'countryCode',
    Extension = 'extension',
    BestTime = 'bestTime',
    Timezone = 'timezone',
    DialNumber = 'dialNumber',
    PreferredPhone = 'preferredPhone',
}

export enum EmailField {
    Emails = 'emails',
    EmailType = 'emailType',
    EmailAddress = 'emailAddress',
    Remove = 'remove',
    PreferredEmail = 'preferredEmail',
}

export enum RoleField {
    FirstName = 'firstName',
    LastName = 'lastName',
    MiddleName = 'middleName',
    Gender = 'gender',
    Identifications = 'identifications',
    UsCitizen = 'usCitizen',
    PermanentResident = 'permanentResident',
    Relationship = 'relationshipToParty',
    Prefix = 'prefix',
    Suffix = 'suffix',
    TrustType = 'trustType',
    DateOfBirth = 'dateOfBirth',
    PartyType = 'partyType',
    ReasonChange = 'changeReason',
    SupportingDocument = 'supportingDocumentAttached',
    IdentificationValue = 'identificationValue',
    IssueCountry = 'issueCountry',
    TrustDate = 'trustDate',
    PreferredCommunicationType = 'preferredCommunicationType',
    EntityType = 'entityType',
}

export enum SignatureField {
    signPresent = 'isSignedPresent',
    signDesignation = 'signDesignation',
    signDate = 'signDate',
}

export enum Links {
    Internal500CTAlink = 'https://zinnia.atlassian.net/servicedesk/customer/portal/6',
}

export enum EntityTypeValue {
    SoleProprietorship = 'SOLEPROPRIETORSHIP',
    GeneralPartnership = 'GENERALPARTNERSHIP',
    LimitedPartnership = 'LIMITEDPARTNERSHIP',
    SCorporation = 'SCORPORATION',
    CCorporation = 'CCORPORATION',
    LimitedLiabilityCompany = 'LIMITEDLIABILITYCOMPANY',
    CharitableOrganization = 'CHARITABLEORGANIZATION',
    Estate = 'ESTATE',
    Corporation = 'CORPORATION',
    Other = 'UNKNOWN',
}

export enum Action {
    ADD = 'ADD',
    REMOVE = 'REMOVE',
    UPDATE = 'UPDATE',
    NONE = 'NONE',
    DELETE = 'DELETE',
}

export enum CarrierCode {
    Farmers = 'FNWL',
}

export const FarmersPlanCodes = ['TR0101', 'TL0101'];

export enum TransactionName {
    Freelook = 'Freelook',
    Withdrawal = 'Withdrawal',
}
