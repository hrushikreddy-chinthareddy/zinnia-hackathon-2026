import {
    ariaDescribedByIds,
    // enumOptionsIndexForValue,
    // enumOptionsValueForIndex,
    // labelValue,
    optionId,
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
} from '@rjsf/utils';
import { Radio } from '@zinnia/bloom/components';
// import _pick from 'lodash/pick';

export default function RadioWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    id,
    options,
    value,
    // required,
    label,
    // hideLabel,
    // onChange,
    // onBlur,
    // onFocus,
    disabled,
}: // readonly,
WidgetProps<T, S, F>) {
    // const { enumOptions, enumDisabled, emptyValue } = options;
    const { enumOptions, enumDisabled } = options;

    const newOptions = Array.isArray(enumOptions)
        ? enumOptions.map((option, index) => ({
              label: option.label,
              ariaLabel: option.label,
              value: option.value,
              key: String(index),
              name: id,
              id: optionId(id, index),
              disabled: Array.isArray(enumDisabled) && enumDisabled.indexOf(option.value) !== -1,
              'aria-describedby': ariaDescribedByIds<T>(id),
          }))
        : [];

    return (disabled as boolean) ? (
        <div>{value}</div>
    ) : (
        <Radio defaultValue="option1" groupLabel={label} id="radio-group-default" options={newOptions} />
    );
}
