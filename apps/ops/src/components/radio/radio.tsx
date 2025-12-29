import {
    RadioGroupItemProps,
    RadioGroupProps,
} from '@radix-ui/react-radio-group';
import clsx from 'clsx';
import { InputHTMLAttributes } from 'react';

import { RadioTest } from '@deps/jest/constants/test-id-constants';

import { radioClasses } from './radio.helpers';
import FieldLabel from '../fields/field-label';

export enum RadioVariant {
    Default = 'default',
    Inactive = 'inactive',
}

export enum RadioOrientation {
    Horizontal = 'horizontal',
    Vertical = 'vertical',
}

export type RadioItem = {
    label: string;
    subElement?: JSX.Element;
} & RadioGroupItemProps &
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export type RadioProps = {
    label?: string;
    'data-testid'?: string;
    items: RadioItem[];
    variant?: RadioVariant;
    readonly?: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    alignItems?: string;
    id?: string;
} & Omit<RadioGroupProps, 'onChange'>;

export default function Radio({
    label,
    required,
    items,
    orientation = RadioOrientation.Vertical,
    value,
    variant = RadioVariant.Default,
    onChange,
    disabled = false,
    'data-testid': dataTestId,
    name,
    readonly,
    className,
    id = '',
}: RadioProps) {
    const classes = radioClasses(variant);

    const flexDirection =
        orientation === RadioOrientation.Vertical ? 'flex-col' : 'flex-row';

    const createRadioChangeEvent = (
        value: string,
        currentValue: string | null | undefined
    ): React.ChangeEvent<HTMLInputElement> => {
        return {
            target: {
                value,
                checked: currentValue === value,
            },
        } as React.ChangeEvent<HTMLInputElement>;
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLDivElement>,
        item: { value: string | null },
        variant: RadioVariant,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
        value?: string | null
    ) => {
        if (variant === RadioVariant.Inactive) {
            return;
        }

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange(createRadioChangeEvent(item?.value || '', value));
        }
    };

    return (
        <div>
            <FieldLabel label={label} required={required} classNames="!mb-2" />
            <div
                className={`flex ${flexDirection} items-start gap-4`}
                data-testid={RadioTest.Radio}
            >
                {items.map((item, index) => {
                    const containerClasses = clsx('flex flex-row gap-3', {
                        'items-start': !!item.subElement,
                        'items-center': !item.subElement,
                    });

                    const disabledClass =
                        item?.disabled ?? disabled
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer';

                    const labelClasses = clsx('body-sm', {
                        hidden: !!item.subElement,
                        'pointer-events-none':
                            disabled || variant === RadioVariant.Inactive,
                    });

                    const readonlyClass = readonly
                        ? '!cursor-not-allowed opacity-50'
                        : '';

                    return (
                        <div
                            key={item.value}
                            className={`${containerClasses} ${className}`}
                        >
                            <input
                                type="radio"
                                value={item.value}
                                className={`${classes} ${disabledClass} ${readonlyClass}`}
                                tabIndex={0}
                                checked={value === item.value}
                                data-testid={dataTestId}
                                name={name || label}
                                id={`radio-${label}-${index}-${id}`}
                                onChange={() => undefined}
                                disabled={
                                    readonly || (item?.disabled ?? disabled)
                                }
                                onClick={() => {
                                    onChange(
                                        createRadioChangeEvent(
                                            item.value,
                                            value
                                        )
                                    );
                                }}
                                onKeyDown={(e) =>
                                    handleKeyDown(
                                        e,
                                        item,
                                        variant,
                                        onChange,
                                        value
                                    )
                                }
                            />
                            {item.subElement}
                            <label
                                className={labelClasses}
                                aria-label={`Select ${item.value}`}
                                htmlFor={`radio-${label}-${index}-${id}`}
                                {...(disabled && {
                                    'aria-disabled': 'true',
                                })}
                            >
                                {item.label}
                            </label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
