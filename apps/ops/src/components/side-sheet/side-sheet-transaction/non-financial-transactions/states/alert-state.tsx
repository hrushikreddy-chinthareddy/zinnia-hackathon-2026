import { useTranslation } from 'next-i18next';

import CardInfo from '@deps/components/card/card-info/card-info';
import { TranslationFiles } from '@deps/config/translations';
import { ReactComponent as CircleExclamationIcon } from '@deps/styles/elements/icons/circles/circle-exclamation.svg';

interface AlertStateProps {
    ctaAction: () => void;
}

const AlertState = ({ ctaAction }: AlertStateProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.states.alert',
    });

    return (
        <CardInfo
            className="mt-8"
            cta={{ action: ctaAction, text: t('cta') }}
            icon={
                <CircleExclamationIcon
                    className="text-semantic-error"
                    height={50}
                    width={50}
                />
            }
            subtitle={t('emailSubtitle')}
            title={t('emailTitle')}
        />
    );
};

export default AlertState;
