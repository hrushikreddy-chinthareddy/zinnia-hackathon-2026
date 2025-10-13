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

export type ZipWidgetProps<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
> = WidgetProps<T, S, F>;

function ZipWidget<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>(props: ZipWidgetProps<T, S, F>) {
    const { value, onChange, disabled, readonly, rawErrors = [] } = props;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Allow optional + at start, then digits
        if (/^\+?\d*$/.test(val)) {
            onChange(val);
        }
    };
    const numberFormat = { format: '#####' };

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

export default ZipWidget;
