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
}

export interface License {
  licenseNumber: string;
  state: string;
  resident: string;
  status: LicenseStatus;
  effectiveDate: string;
  expiryDate: string;
}

export enum LicenseStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}
