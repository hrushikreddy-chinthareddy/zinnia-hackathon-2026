// @TODO: this is temporary, until we import api types
export enum ProducerType {
  INDIVIDUAL = 'individual',
  CORPORATION = 'corporation',
}

export enum AppointmentStatus {
  APPROVED = 'Approved',
  PENDING = 'Pending',
  TERMINATED = 'Terminated',
  JUST_IN_TIME = 'Just in time',
}

export interface Appointment {
  carrier: string;
  state: string;
  resident: string;
  status: AppointmentStatus;
  effectiveDate: string;
  company: string;
  licenseNumber: string;
}

export interface License {
  number: string;
  type: string;
  state: string;
  resident: string;
  status: LicenseStatus;
  effectiveDate: string;
  expiryDate: string;
  suspensionStartDate: string;
  suspensionEndDate: string;
  expirationDate: string;
  inactivationReason: string;
  lineOfAuthorities: LineOfAuthority[];
}

export enum LicenseStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export interface LineOfAuthority {
  type: string;
  label: string;
  status: string;
  effectiveDate: string;
  expiryDate: string;
}
