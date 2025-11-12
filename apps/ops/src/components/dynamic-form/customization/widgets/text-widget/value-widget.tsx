import { WidgetProps } from '@rjsf/utils';
import { useEffect, useState } from 'react';

import Field, {
    FieldFormat,
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';

export const ValueWidget = function (props: WidgetProps) {
    const {
        id,
        value,
        disabled,
        readonly,
        required,
        onChange,
        placeholder,
        schema,
        rawErrors,
    } = props;
    const [inputVal, setInputVal] = useState<string>(value);
    const numberFormat = {
        type: 'number' as FieldFormat,
        decimalPlaces: 2,
        format: 'en-US',
    };

    const formatNumber = (num: any) => {
        return parseFloat(num).toLocaleString('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedVal = e.target.value.toString();
        setInputVal(updatedVal);
        onChange(updatedVal);
    };

    useEffect(() => {
        if (value === undefined) setInputVal('');
    }, [value]);

    return (disabled as boolean) ? (
        <div>{inputVal}</div>
    ) : readonly ? (
        <>{formatNumber(inputVal)}</>
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <Field
                name={id}
                value={inputVal}
                formatOptions={numberFormat}
                leading={<div>$</div>}
                id={id}
                disabled={disabled}
                required={required}
                readOnly={readonly}
                placeholder={placeholder}
                onChange={handleChange}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                variant={
                    rawErrors && rawErrors?.length > 0
                        ? FieldVariant.Error
                        : FieldVariant.Default
                }
            />
        </div>
    );
};

export default ValueWidget;
