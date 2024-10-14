import clsx from 'clsx';

import ClickWrapper from '@deps/components/click-container/click-wrapper';
import Content, { ContentVariant } from '@deps/components/content/content';
import { ProgressBarStepsTest } from '@deps/jest/constants/test-id-constants';
import { ReactComponent as CheckmarkIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

export interface Step {
    ariaLabel: string;
    component?: JSX.Element;
    index: number;
    isVisible?: () => boolean;
    isCompleted?: boolean;
    isDisabled?: boolean;
    screenReaderLabel: string;
    text: string;
}

interface ProgressBarStepsItemProps extends Step {
    isActive?: boolean;
    onClick: () => void;
}

const ProgressBarStepsItem = ({
    onClick,
    text,
    index,
    isCompleted,
    isDisabled,
    isActive,
    screenReaderLabel = '',
    ariaLabel: clickContainerAriaLabel = '',
}: ProgressBarStepsItemProps) => {
    const isCompletedAndNotDisabled = isCompleted && !isDisabled;
    const icon = isCompletedAndNotDisabled ? (
        <CheckmarkIcon className="mr-1 text-semantic-success" height={24} width={24} />
    ) : (
        `${index + 1}. `
    );

    const stepsContainerClasses = clsx('relative flex h-full flex-row gap-1 items-center justify-center', {
        'pointer-events-none bg-gray-50': isDisabled,
        'hover:h-13 bg-white': !isDisabled,
    });

    const colorBarClasses = clsx('absolute left-0 right-0 top-0 z-10 w-full group-hover:h-1.5 group-active:h-1.5', {
        'bg-primary': !isDisabled && isActive,
        'h-1.5': isActive,
    });

    const contentContainerClasses = clsx('flex flex-row items-center justify-center sm:focus-visible:outline sm:focus-visible:outline-2 sm:focus-visible:outline-offset-4 sm:focus-visible:outline-semantic-focus sm:focus-visible:rounded');

    const contentClasses = clsx('text-center', {
        'text-gray-600': isDisabled,
    });

    const stepsItemContainer = (
        <div className={stepsContainerClasses} data-testid={ProgressBarStepsTest.StepsContainer}>
            <div className={contentContainerClasses} data-testid={ProgressBarStepsTest.ContentContainer} tabIndex={isDisabled ? -1 : 0}>
                {isCompletedAndNotDisabled && icon}
                <Content
                    details={`${!isCompletedAndNotDisabled ? icon : ''}${text}`}
                    variant={ContentVariant.BodySm}
                    className={contentClasses}
                    data-testid={ProgressBarStepsTest.StepText}
                />
                <div className="sr-only">{screenReaderLabel}</div>
            </div>
        </div>
    );

    return (
        <ClickWrapper onClick={onClick} classes="h-14 !p-0 focus-within" ariaLabel={clickContainerAriaLabel} isDisabled={isDisabled}>
            <div className={colorBarClasses}></div>
            {stepsItemContainer}
        </ClickWrapper>
    );
};

export default ProgressBarStepsItem;
