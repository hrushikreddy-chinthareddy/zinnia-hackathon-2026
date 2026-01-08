import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import {
    isNullEmptyOrUndefined,
    translateYearOrYears,
} from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

interface FixedCostPeriodProps {
    fixedCostPeriod: number | undefined;
    fixedCostPeriodLeft: number | undefined;
}

const FixedCostPeriod = ({
    fixedCostPeriod,
    fixedCostPeriodLeft,
}: FixedCostPeriodProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    return (
        <div>
            <Label
                label={t('policy.detailCards.policyTimeline.fixedCostPeriod')}
                tooltipBody={t(
                    'policy.detailCards.policyTimeline.fixedCostPeriodTooltip'
                )}
                tooltipTitle={t(
                    'policy.detailCards.policyTimeline.fixedCostPeriod'
                )}
                variant={LabelVariant.FieldLabel}
            />
            <Content
                details={translateYearOrYears(fixedCostPeriod, t)}
                variant={ContentVariant.BodySm}
            />
            {fixedCostPeriodLeft && (
                <Content
                    className="text-gray-600"
                    details={
                        isNullEmptyOrUndefined(fixedCostPeriodLeft)
                            ? DEFAULT_ERROR_STRING
                            : (t('temporal.timeLeft', {
                                  timespan: translateYearOrYears(
                                      fixedCostPeriodLeft,
                                      t
                                  ),
                              }) as string)
                    }
                    variant={ContentVariant.Caption}
                />
            )}
        </div>
    );
};

export default FixedCostPeriod;
