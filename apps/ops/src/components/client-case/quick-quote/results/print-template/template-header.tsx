import { CarrierLogo, CarrierName } from '@zinnia/bloom/components';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

import styles from './print-template.module.css';

export const TemplateHeader = () => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    return (
        <section className={styles.header}>
            <CarrierLogo
                carrier={CarrierName.FARMERS}
                alt={t('clientCase.quickQuoteResults.altLogo') as string}
                height={24}
                width={127}
            />
            <Typography variant={TypographyVariant.H3}>Quick Quote</Typography>
        </section>
    );
};
