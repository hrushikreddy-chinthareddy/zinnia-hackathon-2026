export enum PhoneType {
  Business = 'BUSINESS',
  Fax = 'FAX',
  Home = 'HOME',
  Mobile = 'MOBILE',
  Other = 'OTHER',
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
  bestTime: string;
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
