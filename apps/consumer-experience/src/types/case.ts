// From this doc https://zinnia.atlassian.net/wiki/spaces/ZLCM/pages/4492361733/Process+and+ProcessSubTypes+in+APIs

import {
  CaseInstanceSummary,
  CaseListInstanceResponse,
} from '@zinnia/api-types/types/case';

export enum CaseTypes {
  ADDRESS_CHANGE = 'ADDRESS_CHANGE',
  BANK_INFO_CHANGE = 'BANK_INFO_CHANGE',
  PHONE_CHANGE = 'PHONE_CHANGE',
  BENEFICIARY_CHANGE = 'BENEFICIARY_CHANGE',
  COMMUNICATION_PREFERENCE_CHANGE = 'COMMUNICATION_PREFERENCE_CHANGE',
}

export interface CaseSummary extends CaseInstanceSummary {
  processSubType: string;
  caseGroup: string;
}

export interface CaseSearchResponse
  extends Omit<CaseListInstanceResponse, 'data'> {
  data?: Array<CaseSummary>;
}

export enum CaseStatus {
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  PENDING = 'PENDING',
  EXCEPTION = 'EXCEPTION',
  IN_PROGRESS = 'IN_PROGRESS',
  NOT_STARTED = 'NOT_STARTED',
}

export enum StageStatus {
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  PENDING = 'PENDING',
  EXCEPTION = 'EXCEPTION',
  IN_PROGRESS = 'IN_PROGRESS',
  NOT_STARTED = 'NOT_STARTED',
}
