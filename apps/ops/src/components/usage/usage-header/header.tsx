import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import styles from '@deps/components/usage/usage-header/usage-header.module.css';

const UsageHeader = () => {
    const { t } = useTranslation();
    return (
        <div
            id="usage-header"
            className={clsx('flex-wrap', styles.usageHeader)}
        >
            <Typography
                className="flex items-center"
                variant={TypographyVariant.H1}
                data-testid="usage-header-text"
            >
                {t('usageTitle')}
            </Typography>
        </div>
    );
};

export default UsageHeader;
