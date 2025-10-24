import { Loader } from '@zinnia/bloom/components';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';

import styles from './quote-loader.module.css';

export const QuoteLoader = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    return (
        <div className={styles.quoteLoader}>
            <Loader />
            <p className="typography-labels-label-sm">
                {t('clientCase.quickQuoteForm.updating')}
            </p>
        </div>
    );
};
