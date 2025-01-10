import { FormContextType, getUiOptions, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { useMemo } from 'react';

import Radio, { RadioItem } from '@deps/components/radio/radio';

import { HyperLink } from '../hyper-link-widget/hyper-link-widget';

const renderSubElement = (option: any) => {
    switch (option.type) {
        case 'link':
            return (
                <HyperLink
                    title={option.label}
                    label={option.value}
                    value={option.url}
                    type={option.type}
                    disabled={option.disabled}
                    className="border-gray-200 border-1 p-[12px] w-[436px] "
                />
            );
    }
};

function RadioWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    options,
    value,
    disabled,
    onChange,
    id,
    uiSchema,
}: WidgetProps<T, S, F>) {
    const { enumOptions } = options;
    const { customOptions } = getUiOptions<T, S, F>(uiSchema);

    const currentOptions = useMemo(() => {
        return enumOptions || customOptions || [];
    }, [enumOptions, customOptions]);
    const newOptions = useMemo(() => {
        return Array.isArray(currentOptions)
            ? currentOptions.map((option: RadioItem) => ({
                  label: option.label,
                  value: option.value,
                  subElement: renderSubElement(option),
              }))
            : [];
    }, [currentOptions]);

    const handleOnChange = (event: any) => {
        onChange(event.target.value);
    };

    return (
        <div>
            <Radio
                id={id}
                items={newOptions}
                value={value}
                disabled={disabled}
                defaultValue={value}
                onChange={handleOnChange}
                className="items-center justify-between"
            />
        </div>
    );
}

export default RadioWidget;
