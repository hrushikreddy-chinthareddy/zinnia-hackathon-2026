import { ReactNode } from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

import styles from '../content.module.css';

type QuickQuoteNotAvailableReasonCellProps = {
    children: ReactNode;
};

export const QuickQuoteNotAvailableReasonCell = ({
    children,
}: QuickQuoteNotAvailableReasonCellProps) => (
    <div className={styles.notAvailableReasonCell}>
        <Typography
            className={styles.notAvailableText}
            variant={TypographyVariant.BodySm}
        >
            {children}
        </Typography>
    </div>
);
