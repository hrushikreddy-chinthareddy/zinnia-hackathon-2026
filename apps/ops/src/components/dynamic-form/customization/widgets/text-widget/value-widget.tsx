import { WidgetProps } from '@rjsf/utils';

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

    return (disabled as boolean) ? (
        <div>{value}</div>
    ) : readonly ? (
        <>{formatNumber(value)}</>
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <Field
                name={id}
                value={value}
                formatOptions={numberFormat}
                leading={<div>$</div>}
                id={id}
                disabled={disabled}
                required={required}
                readOnly={readonly}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value.toString())}
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
