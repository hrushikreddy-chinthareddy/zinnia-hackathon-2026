import {
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
} from '@rjsf/utils';
import { useEffect, useState } from 'react';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';

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

function NumbersWidget<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>({ value, onChange, readonly, uiSchema }: NumbersWidgetProps<T, S, F>) {
    const { pattern, format, errorMessage = '' } = uiSchema || {};
    const [validate, setValidate] = useState(validatePattern(value, pattern));
    const numberFormat = format ? { format: format as string } : undefined;

    useEffect(() => {
        setValidate(validatePattern(value, pattern));
    }, [value, pattern]);

    return readonly ? (
        value
    ) : (
        <div className="max-w-sm flex w-full flex-col pl-1">
            <Field
                value={value ? value.replace(/\D/g, '') : ''}
                onChange={(e) => onChange(e.target.value)}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                readOnly={readonly}
                formatOptions={numberFormat}
                variant={validate ? FieldVariant.Error : FieldVariant.Default}
                message={validate ? errorMessage : ''}
            />
        </div>
    );
}

export default NumbersWidget;
