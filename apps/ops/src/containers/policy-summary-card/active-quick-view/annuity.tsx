import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { HIDE_ANNUITIES_TOOLTIPS_DEPU_2749 } from '@deps/types/constants';

import { QuickViewRoot } from '../policy-summary-card';

type AnnuityQuickViewFieldProps = {
    label: string;
    details: string;
    tooltipTitle?: string;
    tooltipBody?: string;
};

type AnnuityQuickViewFields = Record<string, AnnuityQuickViewFieldProps>;

export default function AnnuityQuickView({ policy }: BasePolicyComponentArgs) {
    const { t } = useTranslation([TranslationFiles.COMMON, TranslationFiles.COLDEFS]);

    const Fields: AnnuityQuickViewFields = {
        BaseDeathBenefit: {
            label: t('colDefs:policySummary.baseDeathBenefit'),
            tooltipTitle: t('colDefs:policySummary.baseDeathBenefit') as string,
            tooltipBody: t('colDefs:policySummary.baseDeathBenefitTooltip') as string,
            details: numberFormatify(policy.baseDeathBenefit),
        },
        IssueDate: {
            label: t('colDefs:policySummary.issueDate'),
            details: convertKebabedDateString(policy.issueDate),
        },
        AccountValue: {
            label: t('colDefs:policySummary.accountValue'),
            details: numberFormatify(policy.accountValue),
            tooltipTitle: t('colDefs:policySummary.accountValue') as string,
            tooltipBody: t('colDefs:policySummary.accountValueTooltip') as string,
        },
        MaturityDate: {
            label: t('colDefs:policySummary.maturityDate'),
            details: convertKebabedDateString(policy.maturityDate),
        },
        CostBasis: {
            label: t('colDefs:policySummary.costBasis'),
            details: numberFormatify(policy.costBasis),
        },
    };

    return (
        <QuickViewRoot title={t('dashboard.search.results.policySummaryCard.header2Annuity')}>
            {Object.entries(Fields).map(([key, { label, details, ...tooltipProps }]) => (
                <div key={key}>
                    <Label variant={LabelVariant.FieldLabel} label={label} {...(HIDE_ANNUITIES_TOOLTIPS_DEPU_2749 ? {} : tooltipProps)} />
                    <Content details={details} variant={ContentVariant.BodySm} />
                </div>
            ))}
        </QuickViewRoot>
    );
}
