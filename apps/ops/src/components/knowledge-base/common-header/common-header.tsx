import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

import styles from './common-header.module.css';

const CommonHeader = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'zinniaAiAssistant',
    });
    return (
        <div className="flex gap-2 mb-4 items-center">
            <Typography variant={TypographyVariant.H3}>
                {t('chatHeader')}
            </Typography>
            <span
                className={`${styles.betaBadge} text-xs !text-[12px] me-2 px-1.5 rounded text-white`}
            >
                {t('betaBadge')}
            </span>
        </div>
    );
};

export default CommonHeader;
