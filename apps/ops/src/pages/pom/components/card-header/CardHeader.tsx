import { clsx } from 'clsx';
import { Icon, IconType } from '@zinnia/bloom/components';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { default as styles } from './CardHeader.module.css';

export const CardHeader = () => {
    return (
        <div className={clsx(styles.cardHeader)}>
            <Icon type={IconType.USER} className={clsx(styles.icon)} />
            <div>
                <Typography variant={TypographyVariant.H1} className={clsx(styles.header)}>
                    Acme Corporation
                </Typography>
                <Typography variant={TypographyVariant.Caption} className={clsx(styles.caption)}>
                    Tax identification number: 669-45-6789
                </Typography>
            </div>
        </div>
    );
};
