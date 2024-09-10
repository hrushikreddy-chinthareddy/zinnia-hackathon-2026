import clsx from 'clsx';
import { KeyboardEvent } from 'react';

import { handleKeyDown } from '@deps/utils/events';

import { ClickContainerProps } from './click-container.types';

interface ClickWrapperProps extends ClickContainerProps {
    isDisabled?: boolean;
}

const ClickWrapper: React.FC<ClickWrapperProps> = ({
    onClick,
    children,
    isDisabled = false,
    isSelected = false,
    ariaLabel,
    divRef,
    classes,
    role = 'button',
    testId,
}) => {
    const containerClasses = clsx(
        'group relative z-10',
        {
            'cursor-not-allowed focus-visible:outline-0': isDisabled,
            'cursor-pointer p-0.5 hover:border-2 hover:border-accent1 hover:p-0 active:border-2  active:border-primary active:p-0':
                !isDisabled,
            'border-2 border-primary p-0': isSelected,

            // accessibility classes
            'focus-visible:z-20 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-semantic-focus':
                !isDisabled,
        },
        classes
    );

    const handleOnKeyDown = (e: KeyboardEvent<Element>) => {
        if (!isDisabled) {
            handleKeyDown(e, onClick);
        }
    };

    const clickProps = isDisabled
        ? {
              onClick: undefined,
          }
        : {
              onClick,
          };

    return (
        <div
            data-testid={testId}
            className={containerClasses}
            role={role}
            aria-label={ariaLabel}
            aria-hidden={isDisabled}
            ref={divRef}
            onKeyDown={handleOnKeyDown}
            {...clickProps}
        >
            {children}
        </div>
    );
};

export default ClickWrapper;
