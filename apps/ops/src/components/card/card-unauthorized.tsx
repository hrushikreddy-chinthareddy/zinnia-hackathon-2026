import { Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import CardInfo from './card-info/card-info';

export default function UnauthorizedCard() {
    const { t } = useTranslation();
    return (
        <CardInfo
            icon={
                <Icon
                    type={IconType.ALERT_EXCLAMATION}
                    width={50}
                    height={50}
                    className="text-semantic-warning"
                />
            }
            title={t('unauthorized.title')}
            subtitle={t('unauthorized.message')}
            className="mt-8 mx-auto"
        />
    );
}
