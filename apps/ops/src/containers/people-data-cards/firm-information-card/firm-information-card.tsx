import { useTranslation } from 'next-i18next';

import FieldData from '@deps/components/fields/field-data/field-data';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import AgentParty from '@deps/helpers/policy-sor/AgentParty';

import EmptyCard from '../empty-card/empty-card';

interface FirmCardProps {
    selectedPolicyParty: AgentParty | undefined;
}

const FirmInformationCard = ({ selectedPolicyParty }: FirmCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'people.card.firmInformation' });
    const noData = !selectedPolicyParty?.businessName;

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
                    <FieldData label={t('name')}>{selectedPolicyParty.businessName}</FieldData>
                    {/* to do - add the source of these data points */}
                    <FieldData label={t('business')}>{}</FieldData>
                    <FieldData label={t('address')}>{}</FieldData>
                </div>
            )}
        </CardContainer>
    );
};

export default FirmInformationCard;
