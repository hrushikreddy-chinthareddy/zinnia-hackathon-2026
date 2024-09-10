import clsx from 'clsx';

import { RadioTest } from '@deps/jest/constants/test-id-constants';

import { radioClasses } from './radio.helper';
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
    value: string;
};

export interface RadioProps {
    name?: string;
    label?: string;
    'data-testid'?: string;
    required?: boolean;
    orientation?: RadioOrientation;
    items: RadioItem[];
    value: string | undefined;
    variant?: RadioVariant;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

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
}: RadioProps) {
    const classes = radioClasses(variant);

    const flexDirection = orientation === RadioOrientation.Vertical ? 'flex-col' : 'flex-row';

    return (
        <div className={`flex ${flexDirection} items-start gap-4`} data-testid={RadioTest.Radio}>
            <FieldLabel label={label} required={required} classNames="!mb-0" />
            {items.map((item, index) => {
                const containerClasses = clsx('flex flex-row gap-3', {
                    'items-start': !!item.subElement,
                    'items-center': !item.subElement,
                });

                const labelClasses = clsx('body-sm', {
                    hidden: !!item.subElement,
                    'pointer-events-none': disabled || variant === RadioVariant.Inactive,
                });

                return (
                    <div key={item.value} className={containerClasses}>
                        <input
                            type="radio"
                            value={item.value}
                            className={classes}
                            tabIndex={0}
                            aria-label={item.label}
                            checked={value === item.value}
                            data-testid={dataTestId}
                            name={name || label}
                            id={`radio-${label}-${index}`}
                            onChange={() => undefined}
                            disabled={disabled}
                            onClick={() => {
                                const event = {
                                    target: {
                                        value: item.value,
                                        checked: value === item.value,
                                    },
                                } as React.ChangeEvent<HTMLInputElement>;
                                onChange(event);
                            }}
                            onKeyDown={e => {
                                if (variant === RadioVariant.Inactive) return;
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();

                                    const event = {
                                        target: {
                                            value: item.value,
                                            checked: value === item.value,
                                        },
                                    } as React.ChangeEvent<HTMLInputElement>;
                                    onChange(event);
                                }
                            }}
                        />
                        {item.subElement}
                        <label
                            className={labelClasses}
                            aria-label={`Select ${item.value}`}
                            htmlFor={`radio-${label}-${index}`}
                            aria-disabled={disabled}
                        >
                            {item.label}
                        </label>
                    </div>
                );
            })}
        </div>
    );
}
