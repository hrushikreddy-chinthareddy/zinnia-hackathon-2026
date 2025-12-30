import { RadioGroup } from '@headlessui/react';
import clsx from 'clsx';

import { ButtonGroupTest } from '@deps/jest/constants/test-id-constants';
import { Variant } from '@deps/types/components';
import { LabelValue } from '@deps/types/data';

import { ButtonGroupItem } from './button-group-item/button-group-item';
import { getClasses } from './button-group.helpers';

export type ButtonGroupSize = 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonGroupProps {
    activeValue: string | boolean;
    className?: string;
    disabled?: boolean;
    labels: LabelValue<string>[];
    toggle: (value: string) => void;
    size?: ButtonGroupSize;
    variant?: Variant;
    groupLabel?: string | null;
    hideLabel?: boolean;
    isFullWidth?: boolean;
    overrideWrapperClassName?: string;
}

const ButtonGrp = ({
    activeValue,
    className,
    disabled = false,
    labels,
    toggle,
    size = 'md',
    variant = 'primary',
    groupLabel = '',
    hideLabel,
    isFullWidth,
    overrideWrapperClassName,
}: ButtonGroupProps) => {
    const baseClassnames = clsx(
        'relative box-border h-[42px] justify-center px-6 font-secondary text-md leading-5.5'
    );
    const classNames = getClasses(
        size,
        variant,
        `whitespace-nowrap rounded-full font-primary ${className}`,
        disabled
    );

    const labelsLength = labels.length;
    const gridLayoutClassNames = clsx('box-border grid', {
        'grid-cols-1': labelsLength === 1,
        'grid-cols-2': labelsLength === 2,
        'grid-cols-3': labelsLength === 3,
        'grid-cols-4': labelsLength === 4,
        'grid-cols-5': labelsLength === 5,
        'grid-cols-6': labelsLength === 6,
        'grid-cols-7': labelsLength === 7,
        'grid-cols-8': labelsLength === 8,
        'grid-cols-9': labelsLength === 9,
        'grid-cols-10': labelsLength === 10,
        'grid-cols-11': labelsLength === 11,
        'grid-cols-12': labelsLength === 12,
    });

    const labelClassNames = clsx(
        'my-0 mb-1 inline-block font-primary text-sm font-bold leading-[18px]',
        {
            'sr-only': hideLabel || !groupLabel,
        }
    );

    const radioGroupClassNames = clsx({
        'w-full': isFullWidth,
        'min-w-[255px]': isFullWidth && size === 'xxs',
        'min-w-[455px]': isFullWidth && size !== 'xxs',
    });

    return (
        <div className="flex">
            <RadioGroup
                value={activeValue}
                onChange={toggle}
                data-testid={ButtonGroupTest.TOGGLE}
                className={radioGroupClassNames}
            >
                <RadioGroup.Label className={labelClassNames}>
                    {groupLabel}
                </RadioGroup.Label>
                <div
                    className={overrideWrapperClassName || gridLayoutClassNames}
                >
                    {labels.map(
                        (
                            {
                                value,
                                label,
                                testId,
                                disabled: itemDisabled = false,
                            },
                            i
                        ) => {
                            return (
                                <RadioGroup.Option
                                    disabled={true}
                                    value={value ?? ''}
                                    key={label}
                                    aria-label={label}
                                >
                                    {({ checked }) => (
                                        <ButtonGroupItem
                                            checked={checked}
                                            disabled={disabled || itemDisabled}
                                            label={label}
                                            onClick={() => toggle(value ?? '')}
                                            className={`${baseClassnames} ${classNames}`}
                                            position={
                                                i === 0
                                                    ? 'first'
                                                    : i === labels.length - 1
                                                    ? 'end'
                                                    : 'middle'
                                            }
                                            dataTestId={
                                                testId
                                                    ? testId
                                                    : `${ButtonGroupTest.LABEL}-${label}`
                                            }
                                        />
                                    )}
                                </RadioGroup.Option>
                            );
                        }
                    )}
                </div>
            </RadioGroup>
        </div>
    );
};

export default ButtonGrp;
