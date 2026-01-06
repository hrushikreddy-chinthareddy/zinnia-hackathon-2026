import clsx from 'clsx';
import { ReactNode } from 'react';

import styles from './dot-container.module.css';

interface DotContainerProps {
    dotContainerClassName?: string;
    dotLeftSide: ReactNode;
    dotLeftSideClassName?: string;
    dotClassName?: string;
    dotRightSide: ReactNode;
    dotRightSideClassName?: string;
}

// This container has three sections: dotLeftSide - dot - dotRightSide.
// dot will fill in the space between dotLeftSide and dotRightSide
const DotContainer = ({
    dotContainerClassName,
    dotLeftSide,
    dotLeftSideClassName,
    dotClassName,
    dotRightSide,
    dotRightSideClassName,
}: DotContainerProps) => {
    const dotContainerClasses = clsx(
        'dot-container',
        styles.dotContainer,
        dotContainerClassName
    );
    const dotLeftSideClasses = clsx(
        'dot-left-side',
        styles.dotLeftSide,
        dotLeftSideClassName
    );
    const dotRightSideClasses = clsx(
        'dot-right-side',
        styles.dotRightSide,
        dotRightSideClassName
    );
    const dotClasses = clsx('dot', styles.dot, dotClassName);

    return (
        <div className={dotContainerClasses}>
            <div className={dotLeftSideClasses}>{dotLeftSide}</div>
            <hr className={dotClasses} role="presentation" />
            <div className={dotRightSideClasses}> {dotRightSide}</div>
        </div>
    );
};

export default DotContainer;
