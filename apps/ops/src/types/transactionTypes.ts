import { SchemaEnum } from '@zinnia/api-types/types/sor';

const TRANSACTION_TYPES_NOT_IN_SPEC = {
    ADDITIONAL_BENEFIT_END: 'AdditionalBenefitEnd',
    ADDITIONAL_BENEFIT_RE_CERTIFICATION: 'AdditionalBenefitReCertification',
    ADDITIONAL_BENEFIT_RENEW: 'AdditionalBenefitRenew',
    ADDITIONAL_BENEFIT_START: 'AdditionalBenefitStart',
    ADVANCE_ANNUITY_PAYMENT: 'AdvanceAnnuityPayment',
    ANNUITIZATION: 'Annuitization',
    ANNUITIZATION_ANNIVERSARY: 'AnnuitizationAnniversary',
    ANNUITY_BENEFIT_REDUCTION: 'AnnuityBenefitReduction',
    BAILOUT_RENEWAL: 'BailoutRenewal',
    BENEFIT_AMOUNT_AUTO_ADJUSTMENT: 'BenefitAmountAutoAdjustment',
    BENEFIT_BASE_ADJUSTMENT: 'BenefitBaseAdjustment',
    COMMUTATION: 'Commutation',
    COST_BASIS_RECEIVED: 'CostBasisReceived',
    DAILY_RATCHET: 'DailyRatchet',
    DATE_OF_DEATH: 'DateOfDeath',
    DEATH_BENEFIT_LOCK_IN: 'DeathBenefitLockIn',
    DECLINE_FEE_CHANGE: 'DeclineFeeChange',
    DIVIDEND: 'Dividend',
    DIVIDEND_FEATURE_CHARGE: 'DividendFeatureCharge',
    DOLLAR_COST_AVERAGE: 'DollarCostAverage',
    EXCESS_INTEREST_CREDIT: 'ExcessInterestCredit',
    FLAT_EXTRA_CHANGE: 'FlatExtraChange',
    FREE_WITHDRAWAL_RECALCULATION: 'FreeWithdrawalRecalculation',
    GAIN_LOSS_CHARGE_BACK: 'GainLossChargeBack',
    GROWTH_DEATH_BENEFIT_LOCK_IN: 'GrowthDeathBenefitLockIn',
    GUARANTEED_ACCUMULATION_BENEFIT_PERIOD_END:
        'GuaranteedAccumulationBenefitPeriodEnd',
    GUARANTEED_DEATH_BENEFIT_ROLL_UP_RENEW: 'GuaranteedDeathBenefitRollUpRenew',
    GUARANTEED_INDEX_RATES: 'GuaranteedIndexRates',
    GUARANTEED_WITHDRAWAL_BENEFIT_INTEREST_ADJUSTMENT:
        'GuaranteedWithdrawalBenefitInterestAdjustment',
    GUARANTEED_WITHDRAWAL_BENEFIT_PAYMENT_LOCK_IN:
        'GuaranteedWithdrawalBenefitPaymentLockIn',
    GUARANTEED_WITHDRAWAL_BENEFIT_ROLL_UP_RENEW:
        'GuaranteedWithdrawalBenefitRollUpRenew',
    HARDSHIP_END: 'HardshipEnd',
    HARDSHIP_WITHDRAWAL: 'HardshipWithdrawal',
    INTERIM_ANNUAL_PROCESSING: 'InterimAnnualProcessing',
    INVESTMENT_ADVISOR_FEE: 'InvestmentAdvisorFee',
    LIQUIDATED_UNCLAIMED_PROPERTY: 'LiquidatedUnclaimedProperty',
    LONG_TERM_CARE_ASSESSMENT_CHARGE: 'LongTermCareAssessmentCharge',
    LONG_TERM_CARE_BENEFIT_START_STOP: 'LongTermCareBenefitStartStop',
    LONG_TERM_CARE_CERTIFICATION_DATE: 'LongTermCareCertificationDate',
    LONG_TERM_CARE_FEE_START_STOP: 'LongTermCareFeeStartStop',
    LONG_TERM_CARE_WITHDRAWAL: 'LongTermCareWithdrawal',
    MARKET_TIMER_FEE: 'MarketTimerFee',
    NON_LIFE_ANNUITIZATION: 'NonLifeAnnuitization',
    NOTIFICATION_OF_RIDER_CLAIM_START: 'NotificationOfRiderClaimStart',
    PARTIAL_COMMUTATION: 'PartialCommutation',
    PAYOUT_AMOUNT_CHANGE: 'PayoutAmountChange',
    PENDING_PARTIAL_UNCLAIMED_PROPERTY: 'PendingPartialUnclaimedProperty',
    PENDING_UNCLAIMED_PROPERTY: 'PendingUnclaimedProperty',
    PERIODIC_CHARGE: 'PeriodicCharge',
    PROCESSING_DATE: 'ProcessingDate',
    QUALIFIED_PLAN_CHANGE: 'QualifiedPlanChange',
    QUARTERLY_PROCESSING: 'QuarterlyProcessing',
    RATCHET_LOCK_IN: 'RatchetLockIn',
    RECLASSIFICATION: 'Reclassification',
    RESET_BENEFIT_AMOUNTS: 'ResetBenefitAmounts',
    RIDER_ACTIVATION_ANNIVERSARY: 'RiderActivationAnniversary',
    RIDER_ADDITION: 'RiderAddition',
    RIDER_BENEFIT_BASE_LOCK_IN: 'RiderBenefitBaseLockIn',
    RIDER_CHARGE: 'RiderCharge',
    ROLE_BIRTHDAY: 'RoleBirthday',
    SERVICE_CHARGE: 'ServiceCharge',
    SPOUSAL_CONTINUATION: 'SpousalContinuation',
    TRANSFER_CHARGE: 'TransferCharge',
    WITHDRAWN_APPLICATION: 'WithdrawnApplication',
    YEAR_END_GAIN: 'YearEndGain',
};

const combinedTransactionTypes = {
    ...SchemaEnum,
    ...TRANSACTION_TYPES_NOT_IN_SPEC,
};

export const TransactionType = combinedTransactionTypes;

export type TransactionType =
    (typeof combinedTransactionTypes)[keyof typeof combinedTransactionTypes];
