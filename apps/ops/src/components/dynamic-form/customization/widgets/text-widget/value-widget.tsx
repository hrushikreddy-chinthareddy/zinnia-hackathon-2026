import { WidgetProps } from '@rjsf/utils';
import { Label } from '@zinnia/bloom/components';

import { FieldValue } from '@deps/components/field/value/FieldValue';

export const ValueWidget = function (props: WidgetProps) {
    const { id, value, disabled, readonly, required, label, onChange } = props;
    return (disabled as boolean) ? (
        <div>{value}</div>
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <FieldValue
                name={id}
                label={<Label labelFor={id}>{label}</Label>}
                id={id}
                disabled={disabled}
                onChange={onChange}
                required={required}
                readOnly={readonly}
                value={value}
            ></FieldValue>
        </div>
    );
};

export default ValueWidget;
