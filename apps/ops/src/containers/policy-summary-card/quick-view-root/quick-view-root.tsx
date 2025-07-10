import { PropsWithChildren, ReactNode } from 'react';

import { CardColumnsTest } from '@deps/jest/constants/test-id-constants';

import { default as styles } from '../policy-summary-card.module.css';

interface QuickViewProp extends PropsWithChildren {
    children: ReactNode;
    title: string;
}
export const QuickViewRoot = ({ children, title }: QuickViewProp) => {
    return (
        <div
            data-testid={`${CardColumnsTest.ITEMS}-${title}`}
            className={styles.quickViewRoot}
        >
            <h3 className="pb-4 text-lg">{title}</h3>
            <div className={styles.quickViewSection}>{children}</div>
        </div>
    );
};
