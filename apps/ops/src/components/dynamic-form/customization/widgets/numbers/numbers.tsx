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

const validatePattern = (value?: string, pattern?: string) => {
    if (!pattern || !value) return false;
    const patternRegex = new RegExp(pattern);
    return !patternRegex.test(value);
};
const isMaskedSSN = (value?: string) =>
    !!value && /^\*{3}-\*{2}-\d{4}$/.test(value);

const MAX_PHONE_DIGITS = 13;

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
    const {
        pattern,
        format,
        errorMessage = '',
        isPhone = false,
    } = uiSchema || {};
    const [validate, setValidate] = useState(validatePattern(value, pattern));
    const masked = isMaskedSSN(value);
    const numberFormat =
        !masked && format && !isPhone
            ? { format: format as string }
            : undefined;
    const hasUserEditedRef = useRef<boolean>(false);

    const getFullPhoneNumber = () => {
        if (!isPhone || !value) return value;
        if (hasUserEditedRef.current) return value;

        if (value.length <= 7) {
            const phoneObject = formContext?.customData?.actionData
                ?.flatMap((a: any) => a.party?.phones || [])
                ?.find(
                    (phone: any) =>
                        phone?.dialNumber &&
                        phone?.dialNumber?.slice(-7) === value.slice(-7)
                );

            if (phoneObject) {
                return (
                    phoneObject.countryCode +
                    phoneObject.areaCode +
                    phoneObject.dialNumber
                );
            }
        }
        return value;
    };

    const fullPhoneNumber = getFullPhoneNumber();
    const rawDigits = fullPhoneNumber ? fullPhoneNumber.replace(/\D/g, '') : '';

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
        setValidate(validatePattern(value, pattern));
    }, [value, pattern]);

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
