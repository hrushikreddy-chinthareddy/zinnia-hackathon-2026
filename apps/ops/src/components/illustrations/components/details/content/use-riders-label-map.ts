import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';

const prefix = 'clientCase.illustrationDetails.riders' as const;
const _ridersLabelMap = {
    accidentalDeathBenefit: `${prefix}.accidentalDeathBenefit`,
    acceleratedDeathBenefitForTerminalIllness: `${prefix}.`,
    acceleratedDeathBenefitForChronicIllness: ``,
} as const;

export function useRidersLabelMap() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const labelMap = {
        accidentalDeathBenefit: t(
            'clientCase.illustrationDetails.riders.accidentalDeathBenefit'
        ),
        acceleratedDeathBenefit: t(
            'clientCase.illustrationDetails.riders.acceleratedDeathBenefit'
        ),
        acceleratedDeathBenefitForTerminalIllness: t(
            'clientCase.illustrationDetails.riders.acceleratedDeathBenefitForTerminalIllness'
        ),
        acceleratedDeathBenefitForChronicIllness: t(
            'clientCase.illustrationDetails.riders.acceleratedDeathBenefitForChronicIllness'
        ),
        charitableGiving: t(
            'clientCase.illustrationDetails.riders.charitableGiving'
        ),
        childrensTerm: t('clientCase.illustrationDetails.riders.childrensTerm'),
        guaranteedInsurabilityBenefit: t(
            'clientCase.illustrationDetails.riders.guaranteedInsurabilityBenefit'
        ),
        overloanProtection: t(
            'clientCase.illustrationDetails.riders.overloanProtection'
        ),
        ownerWaiverOfDeduction: t(
            'clientCase.illustrationDetails.riders.ownerWaiverOfDeduction'
        ),
        waiverOfDeduction: t(
            'clientCase.illustrationDetails.riders.waiverOfDeduction'
        ),
        waiverOfPremium: t(
            'clientCase.illustrationDetails.riders.waiverOfPremium'
        ),
    } as const;

    return labelMap as typeof labelMap & Record<string, undefined>;
}
