import { WidgetProps } from '@rjsf/utils';

import SelectComponent from '@deps/components/select/select';

const SelectWidget = (props: WidgetProps) => {
    const { id, options, value, required, disabled, readonly, onChange } = props;
    const { enumOptions } = options;

    // Map enumOptions to SelectComponent's expected option format
    const selectOptions =
        enumOptions?.map((option: any) => ({
            value: option.value,
            label: option.label,
        })) ?? [];

    return (disabled as boolean) ? (
        <div>{props.value}</div>
    ) : (
        <SelectComponent
            id={id}
            label={props.label}
            value={value || ''}
            required={required}
            disabled={disabled || readonly}
            onChange={onChange}
            options={selectOptions}
            placeholder="Select an option"
            className="max-w-sm"
        />
    );
};

export default SelectWidget;
