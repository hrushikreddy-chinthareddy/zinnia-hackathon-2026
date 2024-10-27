import { FormContextType, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { Radio } from '@zinnia/bloom/components';

function RadioWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    options,
    value,
    disabled,
    onChange,
    id,
}: WidgetProps<T, S, F>) {
    const { enumOptions } = options;

    const newOptions = Array.isArray(enumOptions)
        ? enumOptions.map(option => ({
              label: option.label,
              ariaLabel: option.label,
              value: option.value,
          }))
        : [];

    return (
        <>
            <Radio id={id} options={newOptions} isDisabled={disabled} defaultValue={value} onValueChange={onChange} />
        </>
    );
}

export default RadioWidget;
