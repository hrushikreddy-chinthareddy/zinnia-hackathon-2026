const prefix = 'clientCase.illustrationDetails';
const _ridersLabelMap = {
    accidentalDeathBenefit: `${prefix}.riders.accidentalDeathBenefit`,
} as const;

export const ridersLabelMap = _ridersLabelMap as typeof _ridersLabelMap &
    Record<string, undefined>;
