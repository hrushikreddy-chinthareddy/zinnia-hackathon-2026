export type QuickQuoteRiders = {
    accidentalDeathBenefitRider?: boolean;
    accidentalDeathBenefitRiderAmount?: number | undefined;
    childrensTermInsuranceRider?: boolean;
    childrensTermInsuranceRiderAmount?: number | undefined;
    waiverOfPremium?: boolean;
    acceleratedDeathBenefitRiderForTerminalIllness?: boolean;
    charitableGivingRider?: boolean;
};

export type QuickQuoteFormData = {
    age?: number;
    sexAtBirth?: 'M' | 'F';
    nicotineUser?: boolean;
    state?: string;
    faceAmount?: number;
    Riders: QuickQuoteRiders;
};
