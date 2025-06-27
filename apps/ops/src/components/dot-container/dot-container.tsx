import clsx from 'clsx';
import { ReactNode } from 'react';

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
        'dot-container flex items-baseline gap-2',
        dotContainerClassName
    );
    const dotLeftSideClasses = clsx(
        'dot-left-side w-fit',
        dotLeftSideClassName
    );
    const dotRightSideClasses = clsx(
        'dot-right-side flex',
        dotRightSideClassName
    );
    const dotClasses = clsx(
        'dot grow border-0 border-b-2 border-dotted border-gray-300',
        dotClassName
    );

    return (
        <div className={dotContainerClasses}>
            <div className={dotLeftSideClasses}>{dotLeftSide}</div>
            <hr className={dotClasses} />
            <div className={dotRightSideClasses}> {dotRightSide}</div>
        </div>
    );
};

export default DotContainer;
