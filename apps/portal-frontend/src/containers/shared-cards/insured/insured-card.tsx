import { useTranslation } from 'next-i18next';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { ReactComponent as ShieldHeart } from '@deps/styles/elements/icons/navigation/shield-heart.svg';

import { InsuredCardData } from './insured-card.helper';

export interface InsuredCardProps {
    insuredCardData: InsuredCardData;
}

const InsuredCard: React.FC<InsuredCardProps> = ({ insuredCardData }) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'policy.detailCards.insured',
    });

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <div className="flex gap-2">
                <ShieldHeart className="mt-1 flex-none text-primary" height={'24px'} role="presentation" width={'24px'} />
                <div>
                    <Typography variant={TypographyVariant.H2}>{t('insured')}</Typography>
                </div>
            </div>
            <div className="mt-4 flex flex-col gap-8 sm:flex-row lg:ml-8">
                <div className="flex flex-col gap-8 lg:flex-row">
                    <div>
                        <Label label={t('fullName')} variant={LabelVariant.FieldLabel} />
                        <NavElement href={insuredCardData.fullName?.href} size={NavElementSize.Small} type={NavElementType.Link}>
                            <PiiWrapper>{insuredCardData.fullName?.text}</PiiWrapper>
                        </NavElement>
                    </div>
                    <div>
                        <Label
                            label={t('riskClass')}
                            tooltipBody={t('riskClassTooltip')}
                            tooltipTitle={t('riskClass')}
                            variant={LabelVariant.FieldLabel}
                        />
                        <Content details={insuredCardData.riskClass} variant={ContentVariant.BodySm} />
                    </div>
                </div>
                <div className="flex flex-col gap-8 lg:flex-row">
                    <div>
                        <Label label={t('currentAge')} variant={LabelVariant.FieldLabel} />
                        <Content pii={true} details={insuredCardData.currentAge} variant={ContentVariant.BodySm} />
                    </div>
                    <div>
                        <Label label={t('ageAtIssue')} variant={LabelVariant.FieldLabel} />
                        <Content pii={true} details={insuredCardData.ageAtIssue} variant={ContentVariant.BodySm} />
                    </div>
                </div>
            </div>
        </CardContainer>
    );
};

export default InsuredCard;
