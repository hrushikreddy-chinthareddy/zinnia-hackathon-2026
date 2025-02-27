import { getUiOptions, WidgetProps } from '@rjsf/utils';

import TextField from '@deps/components/dynamic-form/components/text-field/text-field';
import { replacePlaceholders } from '@deps/helpers/value-placement.helper';
import { formatValueByDataType } from '../../templates/card-templates/card-template';

export const TextWidget = function (props: WidgetProps) {
    const { id, value, disabled, required, rawErrors, onChange, uiSchema, label, placeholder, formContext } = props;
    const { inline, prefix, inlinetext, leading, dataType } = getUiOptions(uiSchema);

    let defaultValue = replacePlaceholders(value, { ...formContext }) || value;

    if (inline) {
        return (
            <div className="grid grid-cols-2 text-md  max-w-screen-sm">
                <div className="text-gray-500">{label}</div>
                <div>
                    {leading ? leading : ''}
                    {formatValueByDataType((dataType as string) || 'text', value)}
                </div>
            </div>
        );
    }

    if (inlinetext) {
        return (
            <div className="text-md ">
                <div className="text-500">{label}</div>
                <div>
                    {prefix ? prefix : ''}
                    {defaultValue}
                </div>
            </div>
        );
    }

    return (disabled as boolean) ? (
        <div>{defaultValue}</div>
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <TextField
                placeholder={placeholder}
                id={id}
                value={defaultValue || ''}
                required={required}
                disabled={disabled}
                onChange={onChange}
                status={rawErrors && rawErrors?.length > 0 ? 'error' : undefined}
            />
        </div>
    );
};

export default TextWidget;
