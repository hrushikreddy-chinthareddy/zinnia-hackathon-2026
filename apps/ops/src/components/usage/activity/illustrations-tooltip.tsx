import { useTranslation } from 'react-i18next';

export const IllustrationsActivityTooltip = () => {
    const { t } = useTranslation();

    return <p>{t('allFields.illustrationsActivityTooltip')}</p>;
};
