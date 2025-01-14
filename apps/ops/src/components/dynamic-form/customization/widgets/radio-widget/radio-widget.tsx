import { FormContextType, getUiOptions, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { AxiosResponse } from 'axios';
import { useContext, useEffect, useMemo, useState } from 'react';

import Radio, { RadioItem } from '@deps/components/radio/radio';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
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

function RadioWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(props1: WidgetProps<T, S, F>) {
    const { options, value, disabled, onChange, id, uiSchema, schema, formData } = props1;

    const formState = useContext(TaskDataContext);
    const { task, setTask } = formState;
    const [selected, setSelected] = useState(value);
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

    async function fetchDetails(apiUrl: string) {
        const response = await client.get<any, AxiosResponse<any>>(`${baseUrl}${apiUrl}`);

        setTask({
            ...task,
            data: { ...task.data, [apiProps?.responseKey]: response?.data },
        });
    }

    useEffect(() => {
        onChange(selected);
    }, [selected]);

    const handleOnChange = (event: any) => {
        if (apiProps?.apiUrl) {
            fetchDetails(apiProps.apiUrl);
        }
        setSelected(event.target.value);
        console.log(value);
    };

    return (
        <div>
            <Radio
                id={id}
                items={newOptions}
                value={selected}
                disabled={disabled}
                defaultValue={selected}
                onChange={handleOnChange}
                className="items-center justify-between"
            />
        </div>
    );
}

export default RadioWidget;
