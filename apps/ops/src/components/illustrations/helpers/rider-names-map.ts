import { RiderName } from '@deps/types/illustrations';

const _riderNamesMap = {
    acceleratedDeathBenefit: 'Accelerated Death Benefit',
    accidentalDeathBenefit: 'Accidental Death Benefit',
    acceleratedDeathBenefitForTerminalIllness:
        'Accelerated Death Benefit Rider for Terminal Illness',
    acceleratedDeathBenefitForChronicIllness:
        'Chronic Illness Accelerated Death Benefit',
    charitableGiving: 'Charitable Giving',
    childrensTerm: "Children's Term Insurance",
    overloanProtection: 'Overloan Protection',
    waiverOfDeduction: 'Waiver of Deduction',
    waiverOfPremium: 'Waiver of Premium',
    guaranteedInsurabilityBenefit: 'Guaranteed Insurability Benefit',
    ownerWaiverOfDeduction: 'Owner Waiver of Deduction',
} satisfies Record<RiderName, string>;

export const riderNamesMap = _riderNamesMap as typeof _riderNamesMap &
    Record<string, undefined>;
