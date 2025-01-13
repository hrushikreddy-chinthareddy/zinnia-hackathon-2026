import { Label } from '@zinnia/bloom/components';
import { clsx } from 'clsx';

import { default as styles } from './Identification.module.css';

export const Identification = () => {
    return (
        <div className={clsx(styles.cardSubSection)}>
            <h2 className={clsx(styles.cardSubSectionHeader, styles.h2)}>Identification</h2>
            <div className={clsx(styles.cardSubSectionContent)}>
                <div>
                    <Label>Type of corporation</Label>
                    <span className={clsx(styles.span)} aria-label="Type of corporation">
                        Third party marketer
                    </span>
                </div>
                <div>
                    <Label>Channel</Label>
                    <span className={clsx(styles.span)} aria-label="Channel">
                        Independent marketing organization
                    </span>
                </div>
                <div>
                    <Label>Tax identification number</Label>
                    <span className={clsx(styles.span)} aria-label="Tax identification number">
                        ***-**-6789
                    </span>
                </div>
            </div>
        </div>
    );
};
