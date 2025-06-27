import clsx from 'clsx';

import { ClickContainerProps } from './click-container.types';
import ClickWrapper from './click-wrapper';

// This component, ClickContainer (an opinionated component), adds a border and some padding
// around the children of the ClickWrapper (base component)
const ClickContainer: React.FC<ClickContainerProps> = (props) => {
    const containerClasses = clsx(
        'rounded border-2 border-gray-100 bg-white !p-0',
        props.classes
    );

    return (
        <ClickWrapper
            {...props}
            classes={containerClasses}
            data-testid={props.testId}
        >
            <div className="p-4" data-testid="bank-details-container">
                {props.children}
            </div>
        </ClickWrapper>
    );
};

export default ClickContainer;
