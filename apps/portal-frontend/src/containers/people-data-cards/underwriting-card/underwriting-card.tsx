import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import Toggle, { ToggleSize, ToggleVariant } from '@deps/components/toggle/toggle';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-small.svg';
import { ReactComponent as ShieldHeartIcon } from '@deps/styles/elements/icons/icons_outlined/shield-heart.svg';

export interface UnderwritingCardProps {
    editable?: boolean;
    riskClass?: string;
    substandardRating?: string;
    disabled?: boolean;
    disabilityStartDate?: string;
    employed?: boolean;
    employmentStatus?: string;
    sexAtBirth?: string;
}

export interface RiskClassProps {
    riskClass?: string;
}

export interface SubstandardRatingProps {
    substandardRating?: string;
}

export interface ImpairmentProps {
    disabled?: boolean;
    disabilityStartDate?: string;
}

export interface SexAtBirthProps {
    sexAtBirth?: string;
}

export interface EmploymentProps {
    employed?: boolean;
    employmentStatus?: string;
}

const RiskClassInfo = ({ riskClass }: RiskClassProps) => {
    const { t } = useTranslation();
    return (
        <div className="mr-8 flex flex-col items-start">
            <Label variant={LabelVariant.FieldLabel} label={t('people.card.underwritingInfo.riskClass')} />
            <Content variant={ContentVariant.BodySm} details={`${riskClass || '-'}`} />
        </div>
    );
};

const SubstandardRatingInfo = ({ substandardRating }: SubstandardRatingProps) => {
    const { t } = useTranslation();
    return (
        <div className="mr-8 flex flex-col items-start">
            <Label variant={LabelVariant.FieldLabel} label={t('people.card.underwritingInfo.substandardRating')} />
            <Content variant={ContentVariant.BodySm} details={`${substandardRating || '-'}`} />
        </div>
    );
};

const ImpairmentInfo = ({ disabled, disabilityStartDate }: ImpairmentProps) => {
    const { t } = useTranslation();
    const isDisabled =
        disabled === null || disabled === undefined ? t('affirmation.no') : disabled ? t('affirmation.yes') : t('affirmation.no');

    return (
        <div className="mr-8 flex flex-col items-start">
            <Label variant={LabelVariant.FieldLabel} label={t('people.card.underwritingInfo.impairment.disabled')} />
            <Content variant={ContentVariant.BodySm} details={isDisabled} />
            {disabled && (
                <>
                    <Label variant={LabelVariant.FieldLabel} label={t('people.card.underwritingInfo.impairment.disabilityStartDate')} />
                    <Content variant={ContentVariant.BodySm} details={`${disabilityStartDate || '-'}`} />
                </>
            )}
        </div>
    );
};

const SexAtBirthInfo = ({ sexAtBirth }: SexAtBirthProps) => {
    const { t } = useTranslation();
    return (
        <div className="mr-8 flex flex-col items-start">
            <Label variant={LabelVariant.FieldLabel} label={t('people.card.underwritingInfo.sexAtBirth')} />
            <Content pii={true} variant={ContentVariant.BodySm} details={`${sexAtBirth || '-'}`} />
        </div>
    );
};

const EmploymentInfo = ({ employmentStatus }: EmploymentProps) => {
    const { t } = useTranslation();
    return (
        <div className="mr-8 flex flex-col items-start">
            <Label variant={LabelVariant.FieldLabel} label={t('people.card.underwritingInfo.employment')} />
            <Content variant={ContentVariant.BodySm} details={`${employmentStatus || '-'}`} />
        </div>
    );
};

export default function UnderwritingCard({ editable = false, ...props }: UnderwritingCardProps) {
    const { t } = useTranslation();

    const showToggle = props.sexAtBirth || props.employed;

    const [additional, setAdditional] = useState(false);
    const visibility = additional ? '' : 'invisible [&>*:nth-child(-n+4)]:visible';
    return (
        <CardContainer classNames="flex w-full flex-col items-start text-gray-900" containerClassNames="rounded-b">
            <div className="flex w-full flex-col md:flex-row md:justify-between">
                <div className="mb-4 flex flex-row items-center">
                    <ShieldHeartIcon width={24} height={24} className="mr-2 text-primary" role="presentation" />
                    <Typography variant={TypographyVariant.H2} className="mr-5">
                        {t('people.card.underwriting')}
                    </Typography>
                    {editable && (
                        <NavElement
                            type={NavElementType.Button}
                            size={NavElementSize.Small}
                            variant={NavElementVariant.Default}
                            startIcon={<AddIcon width={20} height={20} />}
                        >
                            {t('people.card.general.add')}
                        </NavElement>
                    )}
                </div>
                {showToggle && (
                    <div className="mb-5 flex flex-row items-center">
                        <Toggle
                            size={ToggleSize.Default}
                            variant={ToggleVariant.Default}
                            text={t('people.card.underwritingInfo.showAdditional') as string}
                            ariaLabel={t('people.card.underwritingInfo.showAdditional') as string}
                            value={additional}
                            handleToggle={setAdditional}
                        />
                    </div>
                )}
            </div>
            <div className={`grid grid-cols-auto-2 gap-x-8 gap-y-4 md:grid-cols-auto-4 lg:pl-8 ${visibility}`}>
                <RiskClassInfo riskClass={props.riskClass} />
                <SubstandardRatingInfo substandardRating={props.substandardRating} />
                <ImpairmentInfo disabled={props.disabled} disabilityStartDate={props.disabilityStartDate} />
                {additional && <SexAtBirthInfo sexAtBirth={props.sexAtBirth} />}
                {additional && props.employed && <EmploymentInfo employed={props.employed} employmentStatus={props.employmentStatus} />}
            </div>
        </CardContainer>
    );
}
