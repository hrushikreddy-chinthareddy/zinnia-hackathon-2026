import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { ProductType } from '@deps/models/policy/sor-policy';
import { ReactComponent as Calendar } from '@deps/styles/elements/icons/content/calendar.svg';

const BASE_KEY = 'policy.detailCards.policyTimeline.';

export interface PolicyTimelineCardData {
    issueDate: string;
    maturityDate: string | null;
    policyAge: string;
    policyLength: string;
    policyYearsLeft: string | null;
}

interface PolicyTimelineCardProps {
    policyTimelineCardData: PolicyTimelineCardData;
    productType?: ProductType;
}

const PolicyTimelineCard: React.FC<PolicyTimelineCardProps> = ({ policyTimelineCardData, productType }) => {
    const { t } = useTranslation();
    const { issueDate, maturityDate, policyAge, policyLength, policyYearsLeft } = policyTimelineCardData;
    const displayLifetimeCopy = !!productType && (productType === ProductType.UNIVERSALLIFE || productType === ProductType.INDEXEDUNIVERSALLIFE || productType === ProductType.VARIABLEUNIVERSALLIFE)

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <div className="flex gap-2">
                <Calendar className="mt-1 text-primary" role="presentation" width={'24px'} height={'24px'} />
                <Typography variant={TypographyVariant.H2}>{t(`${BASE_KEY}policyTimeline`)}</Typography>
            </div>
            <div className="mt-4 grid grid-cols-[repeat(2,max-content)] gap-8 lg:ml-8 lg:grid-cols-[repeat(4,max-content)]">
                <div>
                    <Label
                        label={t(`${BASE_KEY}policyLength`)}
                        tooltipBody={t(`${BASE_KEY}policyLengthTooltip`)}
                        tooltipTitle={t(`${BASE_KEY}policyLength`)}
                        variant={LabelVariant.FieldLabel}
                    />
                    <Content details={displayLifetimeCopy ? `${t(`${BASE_KEY}lifetime`)}` : policyLength} variant={ContentVariant.BodySm} />
                    {policyYearsLeft && !displayLifetimeCopy && <Content className="text-gray-600" details={policyYearsLeft} variant={ContentVariant.Caption} />}
                </div>
                <div>
                    <Label label={t(`${BASE_KEY}ageOfPolicy`)} variant={LabelVariant.FieldLabel} />
                    <Content details={policyAge} variant={ContentVariant.BodySm} />
                </div>
                <div>
                    <Label label={t(`${BASE_KEY}issueDate`)} variant={LabelVariant.FieldLabel} />
                    <Content details={issueDate} variant={ContentVariant.BodySm} />
                </div>
                {maturityDate && (
                    <div>
                        <Label
                            label={t(`${BASE_KEY}maturityDate`)}
                            tooltipBody={t(`${BASE_KEY}maturityDateTooltip`)}
                            tooltipTitle={t(`${BASE_KEY}maturityDate`)}
                            variant={LabelVariant.FieldLabel}
                        />
                        <Content details={maturityDate} variant={ContentVariant.BodySm} />
                    </div>
                )}
            </div>
        </CardContainer>
    );
};

export default PolicyTimelineCard;
