import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { translateYearOrYears } from '@deps/helpers/string.helpers';

interface TermPolicyLengthProps {
    policyFixedCostPeriod?: number | null;
}

export const TermPolicyLength = ({
    policyFixedCostPeriod,
}: TermPolicyLengthProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.detailCards.policyDetails',
    });
    const { t: tRaw } = useTranslation();

    return (
        <div>
            <Label
                label={t('policyTerm')}
                tooltipBody={t('policyTermTooltip')}
                tooltipTitle={t('policyTerm')}
                variant={LabelVariant.FieldLabel}
            />
            <Content
                details={translateYearOrYears(
                    policyFixedCostPeriod ?? undefined,
                    tRaw
                )}
                variant={ContentVariant.BodySm}
            />
        </div>
    );
};
