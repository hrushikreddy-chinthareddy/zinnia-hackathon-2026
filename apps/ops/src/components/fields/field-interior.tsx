import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import {
    ChangeEvent,
    ClipboardEventHandler,
    FocusEvent,
    ForwardedRef,
    forwardRef,
    useState,
} from 'react';
import { NumericFormat, PatternFormat } from 'react-number-format';

import { FieldProps, FieldSize, FieldType, FieldVariant } from './field';
import FieldIcon from './field-icon';

export default forwardRef(function FieldInterior(
    {
        value,
        label,
        onChange,
        formatOptions,
        startIcon,
        endIcon,
        prefix,
        suffix,
        size,
        type,
        variant,
        handleEnterKey,
        handleSpaceKey,
        preventEditing,
        isReadOnly,
        required,
        maskOnBlur = false,
        disableCopyPaste = false,
        'data-testid': dataTestId,
        ...rest
    }: FieldProps,
    ref: ForwardedRef<HTMLInputElement>
) {
    const { t } = useTranslation();
    const [isMasked, setIsMasked] = useState(false);

    const handleOnBlur = (e: FocusEvent<HTMLInputElement, Element>) => {
        if (typeof rest.onBlur === 'function') rest.onBlur(e);
        setIsMasked(true);
    };

    const handleOnFocus = (e: FocusEvent<HTMLInputElement, Element>) => {
        if (typeof rest.onFocus === 'function') rest.onFocus(e);
        setIsMasked(false);
    };

    const handleOnCopyPaste: ClipboardEventHandler<HTMLInputElement> = (e) => {
        if (disableCopyPaste) {
            e.preventDefault();
        }
    };

    const inputValue =
        isMasked && maskOnBlur ? '*'.repeat((value || '').length) : value;

    const classes = clsx(
        'w-full w-full border-0 bg-transparent p-0 font-secondary text-md font-normal leading-5.5 !outline-none !ring-0',
        {
            'p-0': type === FieldType.Base,
            'px-4 py-2':
                type === FieldType.BaseActive && size === FieldSize.Small,
            'p-4': type === FieldType.BaseActive && size === FieldSize.Default,
            'pl-0': prefix,
            'pr-0': suffix,
        },
        {
            'cursor-pointer select-none caret-transparent': preventEditing,
            'cursor-auto': !preventEditing,
            'text-gray-700': isReadOnly,
        }
    );

    let inputField;

    if (formatOptions) {
        if (formatOptions.type === 'number') {
            const numericClasses = clsx('text-right', classes);

            inputField = (
                <NumericFormat
                    getInputRef={ref}
                    value={inputValue}
                    aria-label={label ? label : t('ariaLabel.genericInput')}
                    aria-labelledby={rest['aria-labelledby']}
                    aria-invalid={rest['aria-invalid']}
                    aria-describedby={rest['aria-describedby']}
                    autoFocus={rest.autoFocus}
                    placeholder={rest.placeholder}
                    className={numericClasses}
                    decimalScale={
                        formatOptions.decimalPlaces
                            ? formatOptions.decimalPlaces
                            : 0
                    }
                    fixedDecimalScale={false}
                    thousandSeparator=","
                    thousandsGroupStyle="thousand"
                    min={rest.min}
                    max={rest.max}
                    maxLength={rest.maxLength}
                    isAllowed={(values) => {
                        const { formattedValue, floatValue } = values;

                        if (floatValue === null || floatValue === undefined) {
                            return formattedValue === '';
                        } else {
                            const max =
                                parseInt(rest.max as string, 10) ||
                                Number.MAX_VALUE;
                            const min = parseInt(rest.min as string, 10) || 0;
                            return floatValue <= max && floatValue >= min;
                        }
                    }}
                    valueIsNumericString={true}
                    onValueChange={(values) => {
                        const { value: rawValue } = values;

                        onChange({
                            target: {
                                value: rawValue,
                            },
                        } as ChangeEvent<HTMLInputElement>);
                    }}
                    tabIndex={variant === FieldVariant.Inactive ? -1 : 0}
                    onBlur={handleOnBlur}
                    onFocus={handleOnFocus}
                    data-testid={dataTestId}
                    readOnly={isReadOnly}
                />
            );
        } else {
            inputField = (
                <PatternFormat
                    getInputRef={ref}
                    value={inputValue}
                    aria-label={label ? label : t('ariaLabel.genericInput')}
                    aria-labelledby={rest['aria-labelledby']}
                    aria-invalid={rest['aria-invalid']}
                    aria-describedby={rest['aria-describedby']}
                    autoFocus={rest.autoFocus}
                    placeholder={rest.placeholder}
                    className={classes}
                    mask={formatOptions.mask ? formatOptions.mask : undefined}
                    format={
                        formatOptions.prefix
                            ? formatOptions.prefix + formatOptions.format
                            : formatOptions.format
                    }
                    valueIsNumericString={true}
                    onValueChange={(values) => {
                        const { value: rawValue } = values;
                        onChange({
                            target: {
                                value: rawValue,
                            },
                        } as ChangeEvent<HTMLInputElement>);
                    }}
                    tabIndex={variant === FieldVariant.Inactive ? -1 : 0}
                    onBlur={handleOnBlur}
                    onFocus={handleOnFocus}
                    data-testid={dataTestId}
                    // TODO: onKeyDown is not firing on PatternFormat.  Need to figure out why.
                />
            );
        }
    } else {
        inputField = (
            <input
                {...rest}
                ref={ref}
                value={inputValue}
                aria-label={label ? label : 'Input Field'}
                aria-labelledby={rest['aria-labelledby']}
                autoFocus={rest.autoFocus}
                placeholder={rest.placeholder}
                className={classes}
                onChange={onChange}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        handleEnterKey?.();
                    }
                    if (event.key === ' ') {
                        handleSpaceKey?.();
                    }
                }}
                tabIndex={variant === FieldVariant.Inactive ? -1 : 0}
                onBlur={handleOnBlur}
                onFocus={handleOnFocus}
                required={required}
                onCopy={handleOnCopyPaste}
                onPaste={handleOnCopyPaste}
                onCut={handleOnCopyPaste}
                data-testid={dataTestId}
            />
        );
    }

    return (
        <div className="flex grow flex-row items-center justify-between">
            <FieldIcon icon={startIcon} variant={variant} className="ml-4" />
            {prefix && (
                <p className="pl-4 font-secondary text-md font-normal leading-5.5">
                    {prefix}
                    &nbsp;
                </p>
            )}
            {inputField}
            {suffix && (
                <p className="pr-4 font-secondary text-md font-normal leading-5.5">
                    &nbsp;
                    {suffix}
                </p>
            )}
            <FieldIcon icon={endIcon} variant={variant} className="mr-4" />
        </div>
    );
});
