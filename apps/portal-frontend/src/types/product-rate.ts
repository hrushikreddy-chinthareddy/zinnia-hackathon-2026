import { CoverageLayer, Party, PolicyParties } from "@deps/models/policy/sor-policy";

export enum ConfiguredSettingId {
    BorrowingInterestRate = 'pBorrIntRate',
    CurrentInterestRate = 'pCurrIntRate',
    LoanInterestRate = 'pLoanIntRateArr',
    MatchRate = 'rMatchPct',
    MaxAmount = 'pMaxFaceAmt',
    MaxAmountT2 = 'pMaxBenT2',
    MaxBenefitPercentage = 'pMaxBenPct',
    MaxBenefitPercentageT2 = 'pMaxBenPctT2',
    MaxNumberOfClaims = 'pMaxClaims',
    MaxNumberOfYearsToPay = 'pMaxYrsPayPrem',
}

export enum CoverageId {
    ChronicIllness = 'Rider_SBLCHR',
    CriticalIllness = 'Rider_SBLCRI',
    TerminalIllness = 'Rider_SBLTRM',
    OverloanProtection = 'Rider_SBLOPR',
    OverloanSafeguard = 'Rider_OPR',
    Child = 'Rider_CTR',
}

export interface RiderBenefit {
    benefitId?: BenefitId;
    [ConfiguredSettingId.MaxNumberOfClaims]?: number;
    [ConfiguredSettingId.MaxAmount]?: number;
    [ConfiguredSettingId.MaxAmountT2]?: number;
    [ConfiguredSettingId.MaxNumberOfYearsToPay]?: number;
    [ConfiguredSettingId.MaxBenefitPercentage]?: number;
    [ConfiguredSettingId.MaxBenefitPercentageT2]?: number;
}

export enum BenefitId {
    ChronicIllness = 'Rider_ChIB',
    CriticalIllness = 'Rider_CrIB',
    TerminalIllness = 'Rider_TIB',
    OverloanProtection = 'Rider_OPR',
    Child = 'Rider_CTR',
}

export const CoverageToBenefitId = {
    [CoverageId.ChronicIllness]: BenefitId.ChronicIllness,
    [CoverageId.CriticalIllness]: BenefitId.CriticalIllness,
    [CoverageId.OverloanProtection]: BenefitId.OverloanProtection,
    [CoverageId.OverloanSafeguard]: BenefitId.OverloanProtection,
    [CoverageId.TerminalIllness]: BenefitId.TerminalIllness,
    [CoverageId.Child]: BenefitId.Child,

}

export const riderChronicIllnessSettings = [
    ConfiguredSettingId.MaxAmount,
    ConfiguredSettingId.MaxNumberOfYearsToPay,
    ConfiguredSettingId.MaxBenefitPercentage,
    ConfiguredSettingId.MaxNumberOfClaims,
]

export const riderCriticalIllnessSettings = [
    ConfiguredSettingId.MaxAmount,
    ConfiguredSettingId.MaxBenefitPercentage,
    ConfiguredSettingId.MaxAmountT2,
    ConfiguredSettingId.MaxBenefitPercentageT2,
    ConfiguredSettingId.MaxNumberOfClaims,
]

export const riderTerminalIllnessSettings = [
    ConfiguredSettingId.MaxAmount,
    ConfiguredSettingId.MaxBenefitPercentage,
    ConfiguredSettingId.MaxNumberOfClaims,
]

// Overloan protection riders do not require any data from the API to show for now
export const riderOverloanProtectionSettings = [
]

export interface ProductRateQueryProps {
    benefitId?: string;
    carrierId?: string;
    coverageLayers?: CoverageLayer[];
    effectiveDate: string;
    errorMessage?: string;
    planCode?: string;
    partyRoles?: PolicyParties[];
    parties?: Party[];
    policyYear?: number;
    resourceId?: ConfiguredSettingId;
}
