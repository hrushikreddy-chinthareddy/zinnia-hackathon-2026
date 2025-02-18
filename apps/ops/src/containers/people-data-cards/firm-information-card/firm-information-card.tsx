import { useTranslation } from 'next-i18next';

import FieldData from '@deps/components/fields/field-data/field-data';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';

import EmptyCard from '../empty-card/empty-card';
import { PersonCardProps } from '../people-data-card-props';

const FirmInformationCard = ({ party, planCode, policyNumber }: PersonCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'people.card.firmInformation' });
    const name = party?.fullName;
    const noData = true;

    return (
        <CardContainer classNames="flex w-full flex-col items-start">
            <Typography className="mr-5" variant={TypographyVariant.H2}>
                {t('label')}
            </Typography>
            {noData ? (
                <div className="mt-4 w-full">
                    <EmptyCard text={t('empty') as string} />
                </div>
            ) : (
                <div className="flex gap-8 mt-4 flex-wrap">
                    <FieldData label={t('name')}>{name}</FieldData>
                    <FieldData label={t('business')}>{}</FieldData>
                    <FieldData label={t('address')}>{}</FieldData>
                </div>
            )}
        </CardContainer>
    );
};

export default FirmInformationCard;
