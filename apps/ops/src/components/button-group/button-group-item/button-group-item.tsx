import clsx from 'clsx';
import React from 'react';
export type ButtonGroupItemPosition = 'first' | 'middle' | 'end' | 'single';

interface ButtonGroupItemProps {
    checked: boolean;
    disabled?: boolean;
    label: string;
    onClick: () => void;
    className: string;
    position?: ButtonGroupItemPosition;
    dataTestId?: string;
}

const getButtonGroupItemClasses = (
    position: ButtonGroupItemPosition,
    classNames: string
) => {
    const positionClasses = {
        first: 'rounded-l-md rounded-r-none border-t-2 border-b-2 border-l-2 border-r-1',
        middle: 'rounded-none border-t-2 border-b-2 border-l-1 border-r-1',
        end: 'rounded-r-md rounded-l-none border-t-2 border-b-2 border-l-1 border-r-2',
        single: 'rounded-md border-2',
    };

    return `${classNames} ${positionClasses[position]}`;
};

export const ButtonGroupItem: React.FC<ButtonGroupItemProps> = ({
    checked,
    disabled = false,
    label,
    onClick,
    className,
    position = 'middle',
    dataTestId,
}) => {
    const baseClasses = clsx(
        `relative box-border inline-flex h-[42px] w-full flex-col items-center justify-center whitespace-nowrap rounded-md font-secondary text-md leading-5.5 outline-none after:invisible after:relative after:mt-[-22px] after:font-bold after:content-[attr(data-label)] focus:outline-none`
    );

    const checkedClasses = clsx({
        'z-19 border-primary !bg-primary-lighter font-bold hover:!bg-primary-lighter':
            checked,
        'border-2 bg-white font-normal': !checked,
    });
    const positionClasses = getButtonGroupItemClasses(position, className);
    const disabledClasses = clsx({
        'cursor-not-allowed !bg-gray-100 text-gray-900': disabled,
        'cursor-pointer': !disabled,
    });
    const btnGroupItemClasses = clsx(
        baseClasses,
        positionClasses,
        checkedClasses,
        disabledClasses
    );

    const handleClick = () => {
        if (!disabled) {
            onClick();
        }
    };

    return (
        <span
            role="radio"
            aria-checked={checked}
            tabIndex={0}
            className={btnGroupItemClasses}
            data-testid={dataTestId}
            data-label={label}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >
            {label}
        </span>
    );
};

export default ButtonGroupItem;
