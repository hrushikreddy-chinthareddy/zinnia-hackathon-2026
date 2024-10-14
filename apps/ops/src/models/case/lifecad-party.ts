export enum SrcPartyType {
    IN = 'IN',
    TR = 'TR',
    CO = 'CO',
}

interface LifeCadAddress {
    SrcAddressId: string;
    AddressStartDate: string;
    AddressEndDate: string;
    ActiveAddress: boolean;
    AddressType: string;
    AddressTypeDesc: string;
    MailIndicator: boolean;
    AddressLine1: string;
    AddressLine2: string;
    AddressLine3: string;
    AddressLine4: string;
    City: string;
    State: string;
    Zip: string;
    ZipPlusFour: string;
    Country: string;
    RoleAddress: boolean;
}

interface LifeCadPhone {
    PhoneType: string;
    PhoneTypeDesc: string;
    PhoneNumber: string;
    PhoneCountry: string;
    SrcPhoneId: string;
    SrcAddressId: string;
    RolePhone: boolean;
}

interface LifeCadTaxWitholding {
    Type: string;
    Exemption: string;
    FilingStatus: string;
    TaxRate: string;
}

export interface LifeCadParty {
    SourceSystem: string;
    Role: string;
    SrcRole: string;
    SrcRoleOptionId: number;
    SrcRoleOptionIdDesc: string;
    SrcNameId: string;
    SrcRoleType: number;
    RoleUniqueID: string;
    RoleStartDate: string;
    RoleEndDate: string;
    RoleStatus: string;
    Gender: string;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Suffix: string;
    FullName: string;
    OrgName: string;
    DateOfBirth: string;
    TaxID: string;
    SplitPercent: string;
    PersonType: string;
    SrcPartyType: string;
    Email: string;
    SrcRelToOwnerId: string;
    RelationshipToOwner: string;
    ElectronicAuth: string;
    PendingAddressUpdate: string;
    TaxToRole: string;
    SrcTaxToNameId: string;
    SrcTaxToOptionId: string;
    SrcTaxToRoleId: string;
    SrcPhoneId: string;
    SrcAddressId: string;
    SrcRoleCountId: string;
    Address: LifeCadAddress[];
    Phone: LifeCadPhone[];
    Banking: LifeCadBanking[];
    TaxWithHolding: LifeCadTaxWitholding[];
}

export type LifeCadBanking = {
    BankId: number;
    BankName: string;
    RoutingNumber: string;
    AccountNumber: string;
    AccountType: string;
    Purpose: string;
    PaymentMethod: string;
    BankStartDate: Date;
    BankEndDate: Date;
    ListBillId: number;
    EFTCode: string;
    EFTStatus: string;
};
