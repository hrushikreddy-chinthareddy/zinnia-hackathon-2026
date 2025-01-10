import { Icon, IconType } from '@zinnia/bloom/components';
import CardInfo from './card-info/card-info';
import { useTranslation } from 'next-i18next';

export default function UnauthorizedCard() {
    const { t } = useTranslation();
    return (
        <CardInfo
            icon={<Icon type={IconType.ALERT_EXCLAMATION} width={50} height={50} className="text-semantic-warning" />}
            title={t('unauthorized.title')}
            subtitle={t('unauthorized.message')}
            className="mt-8 mx-auto"
        />
    );
}
