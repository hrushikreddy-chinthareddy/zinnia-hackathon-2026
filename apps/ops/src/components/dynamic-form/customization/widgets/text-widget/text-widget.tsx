import { getUiOptions, WidgetProps } from '@rjsf/utils';

import TextField from '@deps/components/dynamic-form/components/text-field/text-field';

export const TextWidget = function (props: WidgetProps) {
    const { id, value, disabled, required, rawErrors, onChange, uiSchema, label } = props;
    const { inline, prefix } = getUiOptions(uiSchema);

    if (inline) {
        return (
            <div className="grid grid-cols-2 text-md  max-w-screen-sm">
                <div className="text-gray-500">{label}</div>
                <div>
                    {prefix ? prefix : ''}
                    {value}
                </div>
            </div>
        );
    }
    return (disabled as boolean) ? (
        <div>{value}</div>
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <TextField
                id={id}
                value={value || ''}
                required={required}
                disabled={disabled}
                onChange={onChange}
                status={rawErrors && rawErrors?.length > 0 ? 'error' : undefined}
            />
        </div>
    );
};

export default TextWidget;
