import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { TranslationFiles } from '@deps/config/translations';
import { ProductType } from '@deps/models/policy/sor-policy';

import IssueDate from '../display-fields/issue-date';
import PolicyAge from '../display-fields/policy-age';
import PolicyLength from '../display-fields/policy-length';
import { PolicyTimelineCardData } from '../timeline-card';

interface EverlyUlPolicyProps {
    policyTimelineCardData: PolicyTimelineCardData;
    productType?: ProductType;
}

const EverlyUl = ({ policyTimelineCardData, productType }: EverlyUlPolicyProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.detailCards.policyTimeline',
    });
    const { issueDate, maturityDate, policyAge, policyLength, policyYearsLeft } = policyTimelineCardData;

    return (
        <div className="mt-4 grid grid-cols-[repeat(2,max-content)] gap-8 lg:grid-cols-[repeat(4,max-content)]">
            <PolicyLength productType={productType} policyLength={policyLength} policyYearsLeft={policyYearsLeft} />
            <PolicyAge policyAge={policyAge} />
            <IssueDate issueDate={issueDate} />
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
        </div>
    );
};

export default EverlyUl;
