import {
  Address,
  BankAccount,
  Email,
  Phone,
} from '@zinnia/api-types/types/sor';

// export enum PhoneType {
//   Business = 'BUSINESS',
//   Fax = 'FAX',
//   Home = 'HOME',
//   Mobile = 'MOBILE',
//   Other = 'OTHER',
// }

export enum BestTimeType {
  Morning = 'MORNING',
  Afternoon = 'AFTERNOON',
  Evening = 'EVENING',
  Anytime = 'ANYTIME',
}

// export enum EmailType {
//   Personal = 'PERSONAL',
//   Business = 'BUSINESS',
//   Other = 'OTHER',
// }

// export enum AddressType {
//   Residence = 'RESIDENCE',
//   Seasonal = 'SEASONAL',
//   PoBox = 'POBOX',
//   Business = 'BUSINESS',
// }
// export interface Email {
//   recordID?: number | null;
//   startDate?: string | null;
//   endDate?: string | null; // TODO MG: this comes back as null sometimes
//   emailType: EmailType;
//   emailAddress?: string | null;
// }

// export type Phone = {
//   recordID?: number;
//   startDate?: string | null;
//   endDate?: string | null;
//   phoneType: PhoneType;
//   countryCode?: string | null;
//   areaCode?: string | null;
//   dialNumber?: string | null;
//   extension?: string | null;
//   bestTime?: BestTimeType | null;
//   timeZone?: string | null;
// };

// export type Address = {
//   recordID?: number;
//   startDate: string;
//   endDate?: string | null;
//   addressType?: AddressType;
//   addressLine1?: string | null;
//   addressLine2?: string | null;
//   addressLine3?: string | null;
//   city?: string | null;
//   state?: string | null;
//   zipCode?: string | null;
//   zipCodeExtension?: string | null;
//   country?: string | null;
//   preferredAddressIndicator?: string | null;
// };

export interface PhoneProps {
  phones: Phone[];
  title: string;
}

export interface EmailProps {
  emails: Email[];
  title: string;
}

export interface AddressProps {
  addresses: Address[];
  title: string;
  preferredAddressIndicator: string;
  partyId?: string;
}

export interface BankDetail extends BankAccount {
  autopayEnabled: boolean;
}
