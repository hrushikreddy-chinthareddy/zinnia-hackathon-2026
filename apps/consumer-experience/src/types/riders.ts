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

export interface PolicyRiders {
  amount?: number | null;
  charge: {
    chargeID?: string | null;
    value?: number | null;
    effectiveRate: number;
    nextEvaluationDate: string;
  } | null;
  claimStatus: string | null;
  coverageID?: CoverageId | string;
  effectiveDate?: string;
  id?: string;
  ledgerDocId?: string;
  maxChronicIllnessBenefitPct: number;
  maxCriticalIllnessBenefitPct: number | null;
  maxPeriodicPaymentPeriod: string | null;
  nextEvaluationDate: string | null;
  paymentMode: string | null;
  paymentOption: string | null;
  policyDetailsId?: string;
  riderCode?: string;
  // TODO: figure out possible options here
  riderElected?: string;
  riderExerciseCharge: number | null;
  riderExerciseChargeRate: number | null;
  riderName?: string;
  riderParticipant?: RiderParticipant[];
  riderPaymentAmount: number | null;
  riderPaymentDate: string | null;
  // TODO: figure out possible options here
  status: string;
  t1CriticalRiderPaymentAmount: number | null;
  t1CriticalRiderPaymentDate: number | null;
  t1MaxCriticalIllnessBenefitAmount: number | null;
  t1MaxCriticalIllnessBenefitPct: number | null;
  t2CriticalRiderPaymentAmount: number | null;
  t2CriticalRiderPaymentDate: number | null;
  t2MaxCriticalIllnessBenefitAmount: number | null;
  t2MaxCriticalIllnessBenefitPct: number | null;
  terminalRiderPaymentAmount: number | null;
  terminationDate?: string;
  timestamp?: string;
  type?: string;
  version?: string;
}
