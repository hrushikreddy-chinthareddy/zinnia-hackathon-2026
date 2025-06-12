import { WidgetProps } from '@rjsf/utils';

import Field, { FieldFormat, FieldSize, FieldType } from '@deps/components/fields/field';

export const ValueWidget = function (props: WidgetProps) {
    const { id, value, disabled, readonly, required, onChange, placeholder, schema } = props;
    const numberFormat = { type: 'number' as FieldFormat, decimalPlaces: 2, format: 'en-US' };

    const formatNumber = (num: any) => {
        return parseFloat(num).toLocaleString('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        })
    };

    return (disabled as boolean) ? (
        <div>{value}</div>
    ) : (
        readonly ? <>{formatNumber(value)}</> :
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
                    onChange={e => onChange(e.target.value.toString())}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive} />
            </div>
    );
};

export default ValueWidget;
