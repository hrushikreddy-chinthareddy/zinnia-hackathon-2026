import { WidgetProps } from '@rjsf/utils';

import TextField from '@deps/components/dynamic-form/components/text-field/text-field';

export const TextWidget = function (props: WidgetProps) {
    const { id, value, disabled, readonly, required, label, onChange } = props;
    return (disabled as boolean) ? (
        <div>{value}</div>
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <TextField id={id} value={value || ''} label={label} required={required} disabled={disabled || readonly} onChange={onChange} />
        </div>
    );
};

export default TextWidget;
