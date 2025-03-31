import type TrainingEducation from '../views/training-education/TrainingEducation';
import type { SearchResult } from './search.types';

// @TODO: this is temporary, until we import api types
export enum ProducerType {
  INDIVIDUAL = 'Individual',
  CORPORATION = 'Corporation',
}

export enum CorporationType {
  GENERAL_AGENCY = 'GeneralAgency',
  BROKER_DEALER = 'BrokerDealer',
  INDEPENDENT_MARKETING_ORGANIZATION = 'IndependentMarketingOrganization',
  THIRD_PARTY_MARKETER = 'ThirdPartyMarketer',
  REGISTERED_INVESTMENT_ADVISOR = 'RegisteredInvestmentAdvisor',
}

export enum CarrierName {
  THRIVENT = 'thrivent',
  ZINNIA = 'zinnia',
}

export const Carriers: Record<
  CarrierName,
  { shortName: string; name: string }
> = {
  [CarrierName.THRIVENT]: { shortName: 'THRI', name: 'Thrivent' },
  [CarrierName.ZINNIA]: { shortName: 'zinnia', name: 'Zinnia' },
};

export enum Channel {
  INDEPENDENT_PLANNERS = 'IndependentPlanners',
  INDEPENDENT_MARKETING_ORGANIZATION = 'IndependentMarketingOrganization',
  REGISTERED_INVESTMENT_ADVISOR = 'RegisteredInvestmentAdvisor',
}

export enum AppointmentStatus {
  APPROVED = 'Approved',
  PENDING = 'Pending',
  TERMINATED = 'Terminated',
  JUST_IN_TIME = 'Just in time',
}

export interface Appointment {
  id: string;
  carrier: string;
  state: string;
  resident: string;
  status: AppointmentStatus;
  effectiveDate: string;
  company: string;
  licenseNumber: string;
  lineOfAuthorities: LineOfAuthority[];
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

export interface BackgroundCheck {
  carrier: string;
  dateRequested: string;
  provider: string;
  resultDate: string;
  status: BackgroundCheckStatus;
}

export enum BackgroundCheckStatus {
  IN_PROGRESS = 'In Progress',
  APPROVED = 'Approved',
  UNDER_REVIEW = 'Under Review',
  DENIED = 'Denied',
  CANT_COMPLETE = 'Unable to complete',
}

export enum YesNo {
  YES = 'Yes',
  NO = 'No',
}

export { TrainingEducation };
export { SearchResult };
