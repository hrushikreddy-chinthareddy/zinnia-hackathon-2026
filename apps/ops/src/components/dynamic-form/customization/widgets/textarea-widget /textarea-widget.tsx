import { WidgetProps } from '@rjsf/utils';


import TextAreaField from '@deps/components/dynamic-form/components/text-area-field/textarea-field';

export const TextareaWidget = function (props: WidgetProps) {
    const { id, value, disabled, required, rawErrors, onChange, placeholder } = props;



    return (disabled as boolean) ? (
        <div>{value}</div>
    ) : (
        <div className="flex w-full flex-col">
            <TextAreaField
                placeholder={placeholder}
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

export default TextareaWidget;
