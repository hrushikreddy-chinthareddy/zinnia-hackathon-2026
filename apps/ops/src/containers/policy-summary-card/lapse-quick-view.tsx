import { useTranslation } from 'react-i18next';

import { Content, ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { FeatureType } from '@zinnia/api-types/types/sor';

import { QuickViewRoot } from './quick-view-root/quick-view-root';

export const LapseQuickView = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation();

    const reinstatement = policy.features.getFirstFeatureByType(
        FeatureType.REINSTATEMENT
    );
    const pendingLapse = policy.features.getFirstFeatureByType(
        FeatureType.LAPSEASSESSMENT
    );

    return (
        <QuickViewRoot
            title={t('dashboard.search.results.policySummaryCard.header2')}
        >
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('allFields.lapseEffectiveDate')}
                    tooltipTitle={t('allFields.lapseEffectiveDate')}
                    tooltipBody={t('allFields.lapseEffectiveDateTooltip')}
                />
                <Content
                    details={
                        pendingLapse?.effectiveDate
                            ? convertKebabedDateString(
                                  pendingLapse?.effectiveDate
                              )
                            : DEFAULT_ERROR_STRING
                    }
                    variant={ContentVariant.BodySm}
                />
            </div>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('allFields.reinstatementPeriod')}
                    tooltipTitle={t('allFields.reinstatementPeriod')}
                    tooltipBody={t('allFields.reinstatementPeriodTooltip')}
                />
                <Content
                    details={
                        reinstatement?.period
                            ? `${reinstatement?.period} ${t(
                                  'allFields.year(s)'
                              )}`
                            : DEFAULT_ERROR_STRING
                    }
                    variant={ContentVariant.BodySm}
                />
            </div>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('allFields.underwritingDecision')}
                    tooltipTitle={t('allFields.underwritingDecision')}
                    tooltipBody={t('allFields.underwritingDecisionTooltip')}
                />
                <Content
                    details={
                        reinstatement?.underwritingDecision === 1
                            ? String(t('enums.APPROVED'))
                            : reinstatement?.underwritingDecision === 0
                            ? String(t('enums.DECLINED'))
                            : DEFAULT_ERROR_STRING
                    }
                    variant={ContentVariant.BodySm}
                />
            </div>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('allFields.reinstatementPaymentPeriod')}
                    tooltipTitle={t('allFields.reinstatementPaymentPeriod')}
                    tooltipBody={t(
                        'allFields.reinstatementPaymentPeriodTooltip'
                    )}
                />
                <Content
                    details={
                        reinstatement?.approvalDate && reinstatement?.endDate
                            ? `${convertKebabedDateString(
                                  reinstatement?.approvalDate
                              )} - ${convertKebabedDateString(
                                  reinstatement?.endDate
                              )}`
                            : DEFAULT_ERROR_STRING
                    }
                    variant={ContentVariant.BodySm}
                />
            </div>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('allFields.reinstatementPayment')}
                    tooltipTitle={t('allFields.reinstatementPayment')}
                    tooltipBody={t('allFields.reinstatementPaymentTooltip')}
                />
                <Content
                    details={
                        reinstatement?.totalRequiredAmount != null
                            ? numberFormatify(
                                  reinstatement?.totalRequiredAmount
                              )
                            : DEFAULT_ERROR_STRING
                    }
                    variant={ContentVariant.BodySm}
                />
            </div>

            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('allFields.baseDeathBenefit')}
                    tooltipTitle={t('allFields.baseDeathBenefit')}
                    tooltipBody={t('allFields.baseDeathBenefitTooltip')}
                />
                <Content
                    details={
                        policy.baseDeathBenefit != null
                            ? numberFormatify(policy.baseDeathBenefit)
                            : DEFAULT_ERROR_STRING
                    }
                    variant={ContentVariant.BodySm}
                />
            </div>
        </QuickViewRoot>
    );
};
