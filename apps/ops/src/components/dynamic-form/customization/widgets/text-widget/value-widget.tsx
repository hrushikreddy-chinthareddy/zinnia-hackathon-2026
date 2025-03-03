import { WidgetProps } from '@rjsf/utils';

import { FieldValue } from '@deps/components/field/value/FieldValue';

export const ValueWidget = function (props: WidgetProps) {
    const { id, value, disabled, readonly, required, onChange, placeholder, schema } = props;
    return (disabled as boolean) ? (
        <div>{value}</div>
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <FieldValue
                type={schema?.type as string}
                name={id}
                id={id}
                disabled={disabled}
                onChange={e => onChange(e.target.value)}
                required={required}
                readOnly={readonly}
                value={value}
                placeholder={placeholder}
            ></FieldValue>
        </div>
    );
};

export default ValueWidget;
