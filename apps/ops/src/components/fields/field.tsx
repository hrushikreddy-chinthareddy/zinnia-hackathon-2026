import { ChangeEvent, InputHTMLAttributes, ReactNode, RefObject, useEffect, useRef, useState } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import { FieldTest } from '@deps/jest/constants/test-id-constants';

import FieldClear from './field-clear/field-clear';
import FieldInterior from './field-interior';
import FieldLabel from './field-label';
import FieldUnits, { FieldUnitsLocation } from './field-units';
import clsx from 'clsx';

export enum FieldSize {
    Small = 'small',
    Default = 'default',
}

export enum FieldType {
    Base = 'base',
    BaseActive = 'base-active',
}

export enum FieldVariant {
    Default = 'default',
    Inactive = 'inactive',
    Success = 'success',
    Error = 'error',
}

export type FieldFormat = 'string' | 'number';

// TODO: Leaving this here as a possible implementation in the future
// export type FieldFormat =
//     | 'string'
//     | 'currency'
//     | 'percent'
//     | 'integer'
//     | 'decimal'
//     | 'phone'
//     | 'ssn'
//     | 'zip'
//     | 'date'
//     | 'time'
//     | 'datetime';

export type FieldFormatOptions = {
    format: string;
    type?: FieldFormat;
    decimalPlaces?: number;
    mask?: string;
    prefix?: string;
};

export type FieldProps = {
    disabled?: boolean;
    value?: string;
    formatOptions?: FieldFormatOptions;
    label?: string;
    labelTooltip?: string;
    labelTooltipBody?: string;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    leading?: ReactNode;
    trailing?: ReactNode;
    prefix?: string;
    suffix?: string;
    message?: string | null;
    selected?: boolean;
    size?: FieldSize;
    type?: FieldType;
    variant?: FieldVariant;
    labelClassNames?: string;
    containerClassName?: string;
    preventEditing?: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onClear?: (ref: RefObject<HTMLInputElement>) => void;
    handleEnterKey?: () => void;
    handleSpaceKey?: () => void;
    ['data-testid']?: string;
    isClearable?: boolean;
    isReadOnly?: boolean;
    maskOnBlur?: boolean;
    disableCopyPaste?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export default function Field({
    disabled,
    label,
    labelTooltip,
    labelTooltipBody = '',
    message,
    className,
    labelClassNames,
    containerClassName,
    selected,
    type,
    variant,
    handleEnterKey,
    handleSpaceKey,
    onClick,
    onClear,
    leading,
    trailing,
    isClearable,
    isReadOnly,
    required,
    ...rest
}: FieldProps) {
    const [focus, setFocus] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Tab') {
                setTimeout(() => {
                    const isDescendantOfContainer = containerRef.current && containerRef.current.contains(document.activeElement);
                    setFocus(!!isDescendantOfContainer);
                }, 0);
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    const hoverClass = 'default-hover';
    const focusClass = focus
        ? '[&:has(:focus-visible)]:outline [&:has(:focus-visible)]:outline-2 [&:has(:focus-visible)]:outline-semantic-focus [&:has(:focus-visible)]:outline-offset-[6px]'
        : '';
    const activeClass = 'active:border-primary';
    const selectedClass = `${selected ? 'border-primary' : ''}`;

    const stateClass = type === FieldType.Base ? `${focusClass}` : `${hoverClass} ${focusClass} ${activeClass} ${selectedClass}`;

    const baseDefaultVariantClass = 'text-gray-900 ';
    const baseInactiveVariantClass = 'text-gray-300 border-0 pointer-events-none';
    const baseSuccessVariantClass =
        'text-gray-900 border-0 relative after:absolute after:content-[" "] after:h-[2px] after:w-full after:-bottom-[2px] after:bg-semantic-success !ring-0';
    const baseErrorVariantClass =
        'text-semantic-error border-0 relative after:absolute after:content-[" "] after:h-[2px] after:w-full after:-bottom-[2px] after:bg-semantic-error !ring-0';
    const defaultVariantClasses = 'bg-white border-2 border-gray-200 text-gray-900';
    const inactiveVariantClasses = 'bg-gray-100 border-2 border-gray-300 pointer-events-none text-gray-600';

    const successVariantClasses = 'bg-white border-2 border-semantic-success text-gray-900';
    const errorVariantClasses = 'bg-white border-2 border-semantic-error text-semantic-error';

    let variantClass;
    switch (variant) {
        case FieldVariant.Inactive:
            variantClass = type === FieldType.Base ? baseInactiveVariantClass : inactiveVariantClasses;
            break;
        case FieldVariant.Success:
            variantClass = type === FieldType.Base ? baseSuccessVariantClass : successVariantClasses;
            break;
        case FieldVariant.Error:
            variantClass = type === FieldType.Base ? baseErrorVariantClass : errorVariantClasses;
            break;
        case FieldVariant.Default:
        default:
            variantClass = type === FieldType.Base ? baseDefaultVariantClass : defaultVariantClasses;
            break;
    }

    const classes = `${stateClass} ${variantClass} flex flex-row justify-between rounded-lg ${className}`;

    return (
        <div data-testid={FieldTest.Container} className={clsx('flex flex-col', containerClassName)} onClick={onClick} ref={containerRef}>
            <FieldLabel
                classNames={labelClassNames}
                label={label}
                labelTooltip={labelTooltip}
                variant={variant}
                labelTooltipBody={labelTooltipBody}
                isReadOnly={isReadOnly}
                required={required}
            />
            <div data-testid={FieldTest.Input} className={classes}>
                <FieldUnits variant={variant} location={FieldUnitsLocation.Start}>
                    {leading}
                </FieldUnits>
                <FieldInterior
                    type={type}
                    variant={variant}
                    label={label}
                    handleEnterKey={handleEnterKey}
                    handleSpaceKey={handleSpaceKey}
                    ref={inputRef}
                    isReadOnly={isReadOnly}
                    required={required}
                    {...rest}
                />
                <FieldUnits variant={variant} location={FieldUnitsLocation.End}>
                    {trailing}
                </FieldUnits>
                {isClearable && <FieldClear label={label} {...rest} inputRef={inputRef} onClear={onClear} />}
            </div>
            {message && <AssistiveText text={message} variant={AssistiveTextVariant.Error} className="mt-2" />}
        </div>
    );
}
