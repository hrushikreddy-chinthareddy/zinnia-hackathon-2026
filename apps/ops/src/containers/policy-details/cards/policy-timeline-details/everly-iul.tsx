import { ProductType } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import FreeLookCancelDate from '@deps/containers/policy-summary-card/display-fields/free-look-cancel-date';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';

import FixedCostPeriod from '../display-fields/fixed-cost-period';
import IssueDate from '../display-fields/issue-date';
import PolicyAge from '../display-fields/policy-age';
import PolicyLength from '../display-fields/policy-length';
import { PolicyTimelineCardData } from '../timeline-card';

interface EverlyIulProps {
    policyTimelineCardData: PolicyTimelineCardData;
    productType?: ProductType;
}

const EverlyIul = ({ policyTimelineCardData, productType }: EverlyIulProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.detailCards.policyTimeline',
    });
    const { fixedCostPeriod, fixedCostPeriodLeft, freeLookCancelDate, issueDate, maturityDate, policyAge, policyLength, policyYearsLeft } =
        policyTimelineCardData;

    return (
        <div className="mt-4 grid gap-8 grid-cols-2 sm:flex sm:flex-wrap">
            <PolicyLength productType={productType} policyLength={policyLength} policyYearsLeft={policyYearsLeft} />
            <PolicyAge policyAge={policyAge} />
            <IssueDate issueDate={issueDate} />
            <FreeLookCancelDate freeLookCancelDate={freeLookCancelDate} />
            {maturityDate && (
                <div>
                    <Label
                        label={t('maturityDate')}
                        tooltipBody={t('maturityDateTooltip')}
                        tooltipTitle={t('maturityDate')}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content details={maturityDate} variant={ContentVariant.BodySm} />
                </div>
            )}
            <FixedCostPeriod fixedCostPeriod={fixedCostPeriod} fixedCostPeriodLeft={fixedCostPeriodLeft} />
            <div>
                <Label label={t('freeLookExpiration')} tooltipTitle={t('freeLookExpiration')} variant={LabelVariant.FieldLabel} />
                <Content details={convertKebabedDateString(freeLookCancelDate)} variant={ContentVariant.BodySm} />
            </div>
        </div>
    );
};

export default EverlyIul;
