import {
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
} from '@rjsf/utils';
import { useEffect, useRef, useState } from 'react';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';

import { formatPhoneNumber } from '../widget-helpers';

export type NumbersWidgetProps<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
> = WidgetProps<T, S, F>;

const isMaskedSSN = (value?: string) =>
    !!value && /^\*{3}-\*{2}-\d{4}$/.test(value);

const MAX_PHONE_DIGITS = 13;

function digitsOnlyOrEmpty(v: unknown): string {
    if (v == null || v === '') return '';
    if (typeof v === 'string') return v.replace(/\D/g, '');
    if (typeof v === 'number' && Number.isFinite(v)) {
        return String(v).replace(/\D/g, '');
    }
    return '';
}

function shouldShowNumbersPatternError(
    value: unknown,
    pattern: string | undefined,
    isPhone: boolean
): boolean {
    if (!pattern) return false;
    if (isPhone) return false;
    if (value == null || value === '') return false;
    const s =
        typeof value === 'string'
            ? value
            : typeof value === 'number' && Number.isFinite(value)
            ? String(value)
            : '';
    if (!s) return false;
    try {
        return !new RegExp(pattern).test(s);
    } catch {
        return false;
    }
}

function NumbersWidget<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>({
    value,
    onChange,
    readonly,
    uiSchema,
    formContext,
}: NumbersWidgetProps<T, S, F>) {
    const rawOptions =
        uiSchema && typeof uiSchema === 'object'
            ? (uiSchema['ui:options'] as Record<string, unknown>) ?? {}
            : {};
    const {
        pattern: patternRaw,
        format: formatRaw,
        errorMessage: errorMessageRaw,
        isPhone: isPhoneRaw,
    } = uiSchema || {};
    const pattern = (patternRaw ?? rawOptions.pattern) as string | undefined;
    const format = (formatRaw ?? rawOptions.format) as string | undefined;
    const errorMessage = (errorMessageRaw ??
        rawOptions.errorMessage ??
        '') as string;
    const isPhone = Boolean(isPhoneRaw ?? rawOptions.isPhone ?? false);
    const [validate, setValidate] = useState(
        shouldShowNumbersPatternError(value, pattern, isPhone)
    );
    const masked = isMaskedSSN(value);
    const numberFormat =
        !masked && format && !isPhone
            ? { format: format as string }
            : undefined;
    const hasUserEditedRef = useRef<boolean>(false);

    const getFullPhoneNumber = (): string | undefined => {
        if (!isPhone) {
            if (value == null || value === '') return undefined;
            if (typeof value === 'string') return value;
            if (typeof value === 'number' && Number.isFinite(value)) {
                return String(value);
            }
            return undefined;
        }
        if (value == null || value === '') return '';
        if (typeof value === 'object') return '';
        const strVal = String(value);
        if (!strVal) return '';
        if (hasUserEditedRef.current) return strVal;

        if (strVal.length <= 7) {
            const phoneObject = formContext?.customData?.actionData
                ?.flatMap((a: any) => a.party?.phones || [])
                ?.find(
                    (phone: any) =>
                        phone?.dialNumber &&
                        String(phone.dialNumber).slice(-7) === strVal.slice(-7)
                );

            if (phoneObject) {
                return `${phoneObject.countryCode ?? ''}${
                    phoneObject.areaCode ?? ''
                }${phoneObject.dialNumber ?? ''}`;
            }
        }
        return strVal;
    };

    const fullPhoneNumber = getFullPhoneNumber();
    const rawDigits =
        fullPhoneNumber != null && fullPhoneNumber !== ''
            ? digitsOnlyOrEmpty(fullPhoneNumber)
            : isPhone
            ? ''
            : digitsOnlyOrEmpty(value);

    const displayValue =
        isPhone && !masked ? formatPhoneNumber(rawDigits) : rawDigits;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        hasUserEditedRef.current = true;
        let digits = e?.target?.value?.replace(/\D/g, '');

        if (!digits) {
            onChange('');
            return;
        }
        if (isPhone) {
            digits = digits.slice(0, MAX_PHONE_DIGITS);
        }
        onChange(digits);
    };

    useEffect(() => {
        setValidate(shouldShowNumbersPatternError(value, pattern, isPhone));
    }, [value, pattern, isPhone]);

    return readonly ? (
        displayValue
    ) : (
        <div className="max-w-sm flex w-full flex-col pl-1">
            <Field
                value={masked ? value : displayValue}
                onChange={handleChange}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                readOnly={masked ?? readonly}
                formatOptions={numberFormat}
                variant={
                    !masked && validate
                        ? FieldVariant.Error
                        : FieldVariant.Default
                }
                message={!masked && validate ? errorMessage : ''}
            />
        </div>
    );
}

export default NumbersWidget;
