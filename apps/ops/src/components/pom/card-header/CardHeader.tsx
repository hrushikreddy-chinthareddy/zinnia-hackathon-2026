import { Icon, IconType } from '@zinnia/bloom/components';
import { clsx } from 'clsx';

import { default as styles } from './CardHeader.module.css';

export const CardHeader = () => {
    return (
        <div className={clsx(styles.cardHeader)}>
            <Icon type={IconType.DOCUMENT_TEXT} />
            <div>
                <h1 className={styles.h1}>Acme Corporation</h1>
                <span aria-label="Company tax identification number" className={styles.caption}>
                    Tax identification number: 669-45-6789
                </span>
            </div>
        </div>
    );
};
