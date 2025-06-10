import { FeatureType } from '@xd/api-types/dist/generated-types/sor';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { Content, ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { DEFAULT_EXTENDED_DATE_FORMAT } from '@deps/types/constants';

import BaseDeathBenefit from './display-fields/base-death-benefit';
import { QuickViewRoot } from './policy-summary-card';

export const LapseQuickView = ({ policy }: BasePolicyComponentArgs) => {
    const { t } = useTranslation([TranslationFiles.COMMON, TranslationFiles.COLDEFS]);

    const reinstatement = policy.features.getFirstFeatureByType(FeatureType.REINSTATEMENT);
    const pendingLapse = policy.features.getFirstFeatureByType(FeatureType.LAPSEASSESSMENT);

    let reinstatementPeriodText;

    switch (Number(reinstatement?.period)) {
        case 0:
            reinstatementPeriodText = 'None';
            break;
        case 1:
            reinstatementPeriodText = t('common:temporal.oneYear');
            break;
        default:
            reinstatementPeriodText = t('common:temporal.nYears', { n: reinstatement?.period });
            break;
    }

    return (
        <QuickViewRoot title={t('dashboard.search.results.policySummaryCard.header2')}>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:policySummary.lapseEffectiveDate')}
                    tooltipTitle={t('colDefs:policySummary.lapseEffectiveDate')}
                    tooltipBody={t('colDefs:policySummary.lapseEffectiveDateTooltip')}
                />
                <Content
                    details={pendingLapse?.effectiveDate ? dayjs(pendingLapse?.effectiveDate).format(DEFAULT_EXTENDED_DATE_FORMAT) : '--'}
                    variant={ContentVariant.BodySm}
                />
            </div>
            <div>
                <Label
                    variant={LabelVariant.FieldLabel}
                    label={t('colDefs:policySummary.reinstatementPeriod')}
                    tooltipTitle={t('colDefs:policySummary.reinstatementPeriod')}
                    tooltipBody={t('colDefs:policySummary.reinstatementPeriodTooltip')}
                />
                <Content details={reinstatementPeriodText} variant={ContentVariant.BodySm} />
            </div>
            {reinstatement && (
                <>
                    {!!reinstatement.approvalDate && (
                        <div>
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('colDefs:policySummary.underwritingDecision')}
                                tooltipTitle={t('colDefs:policySummary.underwritingDecision')}
                                tooltipBody={t('colDefs:policySummary.underwritingDecisionTooltip')}
                            />
                            <Content
                                details={
                                    reinstatement?.approvalDate
                                        ? String(t('common:general.approved'))
                                        : String(t('common:general.unapproved'))
                                }
                                variant={ContentVariant.BodySm}
                            />
                        </div>
                    )}

                    {reinstatement.approvalDate && reinstatement.endDate && (
                        <div>
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('colDefs:policySummary.reinstatementPaymentPeriod')}
                                tooltipTitle={t('colDefs:policySummary.reinstatementPaymentPeriod')}
                                tooltipBody={t('colDefs:policySummary.reinstatementPaymentPeriodTooltip')}
                            />
                            <Content
                                details={`${dayjs(reinstatement?.approvalDate).format(DEFAULT_EXTENDED_DATE_FORMAT)} - ${dayjs(
                                    reinstatement?.endDate
                                ).format(DEFAULT_EXTENDED_DATE_FORMAT)}`}
                                variant={ContentVariant.BodySm}
                            />
                        </div>
                    )}

                    {!!reinstatement.paymentAmount && (
                        <div>
                            <Label
                                variant={LabelVariant.FieldLabel}
                                label={t('colDefs:policySummary.reinstatementMinPayment')}
                                tooltipTitle={t('colDefs:policySummary.reinstatementMinPayment')}
                                tooltipBody={t('colDefs:policySummary.reinstatementMinPaymentTooltip')}
                            />
                            <Content details={numberFormatify(reinstatement?.paymentAmount)} variant={ContentVariant.BodySm} />
                        </div>
                    )}
                </>
            )}

            <BaseDeathBenefit baseDeathBenefit={policy.baseDeathBenefit} />
        </QuickViewRoot>
    );
};
