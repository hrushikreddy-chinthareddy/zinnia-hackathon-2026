import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { BasePolicyComponentArgs } from '@deps/helpers/policy-sor/PolicyDetails';
import { convertKebabedDateString } from '@deps/helpers/string.helper';
import { PolicyFeatureFeatureType } from '@deps/models/policy/sor-policy';
import { DEFAULT_ERROR_STRING, HIDE_ANNUITIES_TOOLTIPS_DEPU_2749 } from '@deps/types/constants';

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

    // TODO - BPB: There might be some missing information, but using this for guarantee period for now.  When we have more info, move to PolicyDetails
    const annuityPaymentOption = policy.features.getFirstFeatureByType('Annuity Payment Option' as PolicyFeatureFeatureType);
    // @ts-expect-error SOR Spec doesn't include featureDescription, but it's in the API response
    const paymentOptionDescription = annuityPaymentOption?.featureDescription || (DEFAULT_ERROR_STRING as string);
    const guaranteePeriod = paymentOptionDescription;
    const Fields: AnnuityQuickViewFields = {
        GuaranteePeriod: {
            label: t('colDefs:policySummary.guaranteePeriod'),
            details: guaranteePeriod || DEFAULT_ERROR_STRING,
        },
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
            {Object.entries(Fields).map(([key, {label, details, ...tooltipProps}]) => (
                <div key={key}>
                    <Label variant={LabelVariant.FieldLabel} label={label} {...(HIDE_ANNUITIES_TOOLTIPS_DEPU_2749 ? {} : tooltipProps)} />
                    <Content details={details} variant={ContentVariant.BodySm} />
                </div>
            ))}
        </QuickViewRoot>
    );
}
