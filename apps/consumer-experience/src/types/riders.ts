import { Status } from '@zinnia/api-types/types/sor';

export enum CoverageId {
  ChronicIllness = 'Rider_SBLCHR',
  CriticalIllness = 'Rider_SBLCRI',
  TerminalIllness = 'Rider_SBLTRM',
  OverloanProtection = 'Rider_SBLOPR',
}

export interface RiderParticipant {
  insuredID?: string;
  insuredAgeAtIssue?: number;
}

export interface PolicyRider {
  riderCode?: string;
  coverageId?: string;
  isElected: boolean;
  cost?: number;
  description?: string | null;
  effectiveDate?: string;
  insured?: {
    firstName?: string;
    lastName?: string;
  };
  status?: Status;
  title?: string;
  isOwner: boolean;
  unbornChildIndicator?: boolean | null;
}

export interface RidersAndBenefits {
  riders: PolicyRider[] | null;
  additionalBenefits: PolicyRider[] | null;
}
