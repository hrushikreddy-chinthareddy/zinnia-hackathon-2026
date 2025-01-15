import { FormContextType, getUiOptions, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { AxiosResponse } from 'axios';
import { useMemo } from 'react';

import Radio, { RadioItem } from '@deps/components/radio/radio';
import { ApiProps } from '@deps/models/case/task';
import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';

import { HyperLink } from '../hyper-link-widget/hyper-link-widget';
const baseUrl = baseAppUrl + '/api/';

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

export type RadioWidgetProps<T, S extends StrictRJSFSchema, F extends FormContextType> = WidgetProps<T, S, F> & {
    formData: any;
    setFormData: (data: any) => void;
};
function RadioWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(props1: RadioWidgetProps<T, S, F>) {
    const { options, value, disabled, onChange, id, uiSchema, formData, setFormData } = props1;

    const { enumOptions } = options;
    const { customOptions, props } = getUiOptions<T, S, F>(uiSchema);

    const apiProps = typeof props === 'object' ? (props as ApiProps) : ({} as ApiProps);

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

    async function fetchDetails(apiUrl: string, value: string) {
        const response = await client.get<any, AxiosResponse<any>>(`${baseUrl}${apiUrl}`);

        const data = {
            ...formData,
            [props1.name]: value,
            [apiProps?.responseKey]: response?.data,
        };

        setFormData(data);
    }

    // useEffect(() => {
    //     onChange(selected);
    // }, [selected]);

    const handleOnChange = (event: any) => {
        onChange(event.target.value);
        fetchDetails(apiProps.apiUrl, event.target.value);
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
