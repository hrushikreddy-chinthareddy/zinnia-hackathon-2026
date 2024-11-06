import { WidgetProps } from '@rjsf/utils';

import TextField from '@deps/components/dynamic-form/components/text-field/text-field';

export const TextWidget = function (props: WidgetProps) {
    const { id, value, disabled, required, label, onChange } = props;
    return (disabled as boolean) ? (
        <div>{value}</div>
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <TextField id={id} value={value || ''} required={required} disabled={disabled} onChange={onChange} />
        </div>
    );
};

export default TextWidget;
