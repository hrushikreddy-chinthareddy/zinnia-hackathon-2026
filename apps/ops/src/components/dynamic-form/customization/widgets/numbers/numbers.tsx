import {
    WidgetProps,
    RJSFSchema,
    StrictRJSFSchema,
    FormContextType,
} from '@rjsf/utils';
import React from 'react';

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

function NumbersWidget<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>(props: NumbersWidgetProps<T, S, F>) {
    const {
        value,
        onChange,
        disabled,
        readonly,
        rawErrors = [],
        uiSchema,
    } = props;
    const { pattern, format } = uiSchema || {};

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (pattern || /^\+?\d*$/.test(val)) {
            onChange(val);
        }
    };
    const numberFormat = format
        ? {
              format: format as string,
          }
        : undefined;

    return (
        <div className="max-w-sm flex w-full flex-col pl-1">
            <Field
                value={value || ''}
                onChange={handleChange}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                formatOptions={numberFormat}
                variant={
                    readonly || disabled
                        ? FieldVariant.Inactive
                        : FieldVariant.Default
                }
                message={rawErrors.join(', ')}
            />
        </div>
    );
}

export default NumbersWidget;
