const _riderNamesMap = {
    acceleratedDeathBenefit: 'Accelerated Death Benefit',
    accidentalDeathBenefit: 'Accidental Death Benefit',
    acceleratedDeathBenefitForTerminalIllness:
        'Accelerated Death Benefit for Terminal Illness',
    acceleratedDeathBenefitForChronicIllness:
        'Chronic Illness Accelerated Death Benefit',
    charitableGiving: 'Charitable Giving',
    childrensTerm: "Children's Term Insurance",
    overloanProtection: 'Overloan Protection',
    waiverOfDeduction: 'Waiver of Deduction',
    waiverOfPremium: 'Waiver of Premium',
} as const;

export const riderNamesMap = _riderNamesMap as typeof _riderNamesMap &
    Record<string, undefined>;
