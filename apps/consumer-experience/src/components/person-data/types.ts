export enum PhoneType {
  Business = 'BUSINESS',
  Fax = 'FAX',
  Home = 'HOME',
  Mobile = 'MOBILE',
  Other = 'OTHER',
}

export enum BestTimeType {
  Morning = 'MORNING',
  Afternoon = 'AFTERNOON',
  Evening = 'EVENING',
  Anytime = 'ANYTIME',
}

export enum EmailType {
  Personal = 'PERSONAL',
  Business = 'BUSINESS',
  Other = 'OTHER',
}

export enum AddressType {
  Residence = 'RESIDENCE',
  Seasonal = 'SEASONAL',
  PoBox = 'POBOX',
  Business = 'BUSINESS',
}
export interface Email {
  recordID?: number;
  startDate: string;
  endDate: string; // TODO MG: this comes back as null sometimes
  emailType: EmailType;
  emailAddress: string;
}

export type Phone = {
  recordID?: number;
  startDate: string;
  endDate: string;
  phoneType: PhoneType;
  countryCode: string;
  areaCode: string;
  dialNumber: string;
  extension: string;
  bestTime: BestTimeType;
};

export type Address = {
  recordID?: number;
  startDate: string;
  endDate: string;
  addressType: AddressType;
  addrLine1: string;
  addrLine2: string;
  addrLine3: string;
  city: string;
  state: string;
  zipCode: string;
  zipExt: string;
  addrCountry: string;
  prefAddressInd: string;
};

export interface PhoneProps {
  phoneData: Phone[];
  title: string;
}

export interface EmailProps {
  emailData: Email[];
  title: string;
}

export interface AddressProps {
  addressData: Address[];
  title: string;
}

export interface BankDetails {
  appliesToPartyID: string;
  financialInstitutionPartyID: string;
  startDate: string;
  endDate: string | null;
  nameOnAccount: string;
  accountStatus: string;
  accountType: string;
  accountNumber: string;
  routingNumber: string;
  ibaNumber: string;
  branchName: string;
  accountPurpose: string;
  prefAddressInd: string;
  branchAddress: {
    recordID: number;
    startDate: string;
    endDate: string | null;
    addressType: string;
    addrLine1: string;
    addrLine2: string;
    addrLine3: string;
    city: string;
    state: string;
    zipCode: string;
    zipExt: string;
    addrCountry: string;
  };
  branchPhoneNumber: string;
  autopayEnabled: boolean;
}
