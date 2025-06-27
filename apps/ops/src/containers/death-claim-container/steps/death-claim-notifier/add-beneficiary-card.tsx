import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import ClickContainer from '@deps/components/click-container/click-container';
import { TranslationFiles } from '@deps/config/translations';

export interface IPartyCardProps {
    onCardClick: (value: boolean) => void;
    isNewBene: boolean;
}

export const AddBeneficiaryCard = ({
    onCardClick,
    isNewBene,
}: IPartyCardProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'deathClaims.deathClaimNotification',
    });

    const handleClick = () => {
        onCardClick(!isNewBene);
    };

    return (
        <ClickContainer
            classes={clsx(
                'flex w-min items-center justify-center py-4',
                {
                    'border-primary hover:border-primary ': isNewBene,
                },
                'min-h-[80px] min-w-[300px]'
            )}
            ariaLabel={t('labels.other')}
            onClick={() => handleClick()}
            key={`container-add-bene`}
            isSelected={isNewBene}
        >
            <div key={'add-new-bene-section'} className="text-secondary">
                + {t('labels.other')}
            </div>
        </ClickContainer>
    );
};
