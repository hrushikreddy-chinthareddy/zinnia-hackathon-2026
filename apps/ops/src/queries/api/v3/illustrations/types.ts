import { ValueOf } from 'type-fest';

import { UnderwritingClass } from '@deps/components/illustrations/helpers/illustrationApiSchemas';
import { USStates } from '@deps/constants/geography/us-states';
import { PartyType } from '@deps/models/policy/sor-policy';

export interface SingleYearValuesBase {
    year: number;
    accountValue: number;
    cumulativePremiumAmount: number;
    deathBenefitAmount: number;
    faceAmount: number;
    insuranceAgeAtBeginningOfYear: number;
    insuranceAgeAtEndOfYear: number;
    netAccountValue: number;
    netDeathBenefitAmount: number;
    netSurrenderValue: number;
    policyNetOutlayAmount: number;
    policyValue: number;
    premiumOutlayAmount: number;
    surrenderValue: number;
    premiumAmount: number;
}

export interface SingleYearValuesIUL extends SingleYearValuesBase {
    accumulatedPremiumAmountAtInterest: number;
    costOfInsurance: number;
    cumulativeWithdrawalAmount: number;
    deathBenefitAmountDueToCorridor: number;
    expenseCharge: number;
    forcedWithdrawalDueToGuidelinesAmount: number;
    guidelineLevelPremiumAmount: number;
    guidelineMaximumPremiumAmount: number;
    guidelineSinglePremiumAmount: number;
    interestRate: number;
    maximumWithdrawalAmount: number;
    minimumPremiumAmount: number;
    netAmountAtRisk: number;
    policyNetOutlayAmountForExpenseSummary: number;
    premiumCharge: number;
    premiumOutlayKey: number;
    riderCharges: number;
    surrenderChargeAmount: number;
    taxDueAmount: number;
    taxableAmount: number;
    totalDistributionAmount: number;
    withdrawalAmount: number;
    sevenPayPremiumAmount: number;
}

export interface BaseOutputCoverageValues {
    policyFee: number;
    modalPolicyFee: number;
    premium: number;
    modalPremium: number;
    modalTablePremium: number;
    flatExtraPremium: number;
    modalFlatExtraPremium: number;
    faceAmount: number;
}

export interface RiderOutputCoverageValues extends BaseOutputCoverageValues {
    isIncludedInQuote: boolean;
}

export interface BaseScenario {}

export interface ScenarioCoveragesBase {
    base: BaseOutputCoverageValues;
}

export interface TermLifeCoverages extends ScenarioCoveragesBase {
    acceleratedDeathBenefitForTerminalIllness?: RiderOutputCoverageValues;
    acceleratedDeathBenefitForChronicIllness?: RiderOutputCoverageValues;
    acceleratedDeathBenefitForCriticalIllness?: RiderOutputCoverageValues;
    accidentalDeathBenefit?: RiderOutputCoverageValues;
    charitableGiving?: RiderOutputCoverageValues;
    childrensTerm?: RiderOutputCoverageValues;
    waiverOfPremium?: RiderOutputCoverageValues;
}

export interface IndexedUniversalLifeCoverages extends ScenarioCoveragesBase {
    acceleratedDeathBenefitForTerminalIllness?: RiderOutputCoverageValues;
    acceleratedDeathBenefitForChronicIllness?: RiderOutputCoverageValues;
    acceleratedDeathBenefitForCriticalIllness?: RiderOutputCoverageValues;
    accidentalDeathBenefit?: RiderOutputCoverageValues;
    charitableGiving?: RiderOutputCoverageValues;
    childrensTerm?: RiderOutputCoverageValues;
    guaranteedInsurabilityBenefit?: RiderOutputCoverageValues;
    overloanProtection?: RiderOutputCoverageValues;
    ownerWaiverOfDeduction?: RiderOutputCoverageValues;
    waiverOfDeduction?: RiderOutputCoverageValues;
}

export type Options = {
    revisedIllustration: boolean;
    solveFor: string;
    fixedCostPeriod: number;
    paymentMode: string;
    discountIndicator: string;
    paymentMethod: string;
    premiumDuration?: number;
    premiumDurationOption: string;
    premiumDurationAge?: number;
    premiumDurationYears?: number;
    faceAmount: {
        basis: string;
        frequency: string;
        sequence: Array<{
            from: number;
            through: number;
            value: number | string;
        }>;
    };
    deathBenefitOption: {
        basis: string;
        frequency: string;
        sequence: Array<{
            from: number;
            through: number;
            value: number | string;
        }>;
    };
};

export type IllustrationInputsBase = {
    calculationType: string;
    source: string;
    illustrationRequestDate: string;
    jurisdiction: USStates;
    planCode: string;
    options: Options;
    coverages: Coverage[];
};

export interface TermLifeScenario extends BaseScenario {
    annualTimeSeriesData: SingleYearValuesBase[];
    coverages: TermLifeCoverages;
    initial: {
        totalFaceAmount: number;
        totalPremium: number;
        accountValue: number;
        totalModalPremium: number;
        totalPolicyFee: number;
        totalModalPolicyFee: number;
    };
    lapse: {
        age: number;
        year: number;
    };
}

export interface IndexUniversalLifeScenario extends BaseScenario {
    annualTimeSeriesData: SingleYearValuesIUL[];
    coverages: IndexedUniversalLifeCoverages;
    initial: {
        guidelineLevelPremium: number;
        minimumPremiumAmount: number;
        modifiedEndowmentPremium: number;
        targetPremiumAmount: number;
        totalFaceAmount: number;
        totalPremium: number;
        accountValue: number;
        totalModalPremium: number;
        totalPolicyFee: number;
        totalModalPolicyFee: number;
    };
    lapse: {
        age: number;
        year: number;
    };
}

type Severity = 'INFO' | 'WARNING' | 'ERROR';

export enum IllustrationMessageCode {
    UnreachDesiredSolution = 4000,
    UnsatisfiedSolve = 4001,
    UnsatisfiedRider = 4002,
}

export type responseMessage = {
    code: IllustrationMessageCode | (number & Record<never, never>);
    severity: Severity;
    text: string;
};

export const PARTY_GENDER_MAP = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
    UNISEX: 'UNISEX',
    OTHER: 'OTHER',
} as const;

type PartyGender = ValueOf<typeof PARTY_GENDER_MAP>;

export const PARTY_TYPE_CODE_MAP = {
    INDIVIDUAL: 'INDIVIDUAL',
    ORGANIZATION: 'ORGANIZATION',
    TRUST: 'TRUST',
} as const;

type PartyTypeCode = ValueOf<typeof PartyType>;

interface IllustrationPartyBase {
    partyId: string;
    partyTypeCode: PartyTypeCode;
}

interface InsuredParty extends IllustrationPartyBase {
    gender: PartyGender;
    roleCode: 'INSURED';
}

interface NonInsuredParty extends IllustrationPartyBase {
    roleCode:
        | 'OWNER'
        | 'PRIMARYBENEFICIARY'
        | 'CONTINGENTBENEFICIARY'
        | 'INSURED'
        | 'PAYOR'
        | 'PAYEE'
        | 'AGENT'
        | 'PRIMARYWRITINGAGENT'
        | 'PRIMARYSERVICINGAGENT'
        | 'ADDITIONALSERVICINGAGENT'
        | 'ADDITIONALWRITINGAGENT'
        | 'THIRDPARTYDESIGNEE'
        | 'JOINTOWNER'
        | 'COVERAGEINSURED'
        | 'ASSIGNEE'
        | 'ANNUITANT'
        | 'EXCHANGECOMPANY'
        | 'JOINTANNUITANT'
        | 'GRANTOR'
        | 'TRUSTEE'
        | 'POWEROFATTORNEY'
        | 'AUTHORIZEDSIGNATORY'
        | 'OTHERINTERESTEDPARTY'
        | 'CONTINGENTOWNER';
}

export type IllustrationParty = InsuredParty | NonInsuredParty;

export const COVERAGE_IDS = {
    BASE_COVERAGE: 'BASE_COVERAGE',
    Rider_ABRTRM: 'Rider_ABRTRM',
    Rider_CTR: 'Rider_CTR',
    Rider_ABRCHR: 'Rider_ABRCHR',
    Rider_ADR: 'Rider_ADR',
    Rider_WPR: 'Rider_WPR',
    Rider_CGR: 'Rider_CGR',
    Rider_GIBR: 'Rider_GIBR',
    Rider_OPR: 'Rider_OPR',
    Rider_OWDR: 'Rider_OWDR',
    Rider_WDR: 'Rider_WDR',
    Rider_NHR: 'Rider_NHR',
    Rider_ABRCRI: 'Rider_ABRCRI',
} as const;

export type CoverageId = ValueOf<typeof COVERAGE_IDS>;

export type FlatExtra = object;

export type Participant = {
    participantId: string;
    issueAge: number;
    underwritingClass?: UnderwritingClass;
    subStandardRating?: string;
    flatExtra?: FlatExtra[];
};

export type Coverage = {
    coverageId: CoverageId;
    riderYears?: number;
    currentAmount?: number;
    participants: Participant[];
};
