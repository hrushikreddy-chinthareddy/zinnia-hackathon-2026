import { getUiOptions, WidgetProps } from '@rjsf/utils';

import TextField from '@deps/components/dynamic-form/components/text-field/text-field';

import { formatValueByDataType } from '../../templates/card-templates/card-template';

import style from './text-widget.module.css';

export const TextWidget = function (props: WidgetProps) {
    const { id, value, disabled, required, rawErrors, onChange, uiSchema, label, placeholder, readonly } = props;
    const { inline, prefix, inlinetext, dataType, hideError } = getUiOptions(uiSchema);
    if (inline) {
        return (
            <div className="grid grid-cols-2 text-md  max-w-screen-sm">
                <div className="text-gray-500">{label}</div>
                <div>{formatValueByDataType((dataType as string) || 'text', value)}</div>
            </div>
        );
    }

    if (inlinetext) {
        return (
            <div className="text-md ">
                <div className="text-500">{label}</div>
                <div>
                    {prefix ? prefix : ''}
                    {formatValueByDataType((dataType as string) || 'text', value)}
                </div>
            </div>
        );
    }

    return (disabled as boolean) ? (
        <div>{value}</div>
    ) : readonly ? (
        <>{value}</>
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <TextField
                className={readonly ? style.readOnly : ''}
                placeholder={placeholder}
                id={id}
                value={value || ''}
                required={required}
                disabled={disabled}
                onChange={onChange}
                hideError={hideError}
                status={rawErrors && rawErrors?.length > 0 ? 'error' : undefined}
            />
        </div>
    );
};

export default TextWidget;
