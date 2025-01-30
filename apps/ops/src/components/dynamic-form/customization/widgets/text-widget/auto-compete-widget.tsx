import { FormContextType, getUiOptions, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { IconType, Icon, AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { ChangeEvent } from 'react';

import inputStyles from '@deps/components/search/search-field-toggle/search-field-toggle.module.css';

import style from './text-widget.module.css';
export default function AutoCompleteWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
    props: WidgetProps<T, S, F>
) {
    const {
        id,
        disabled,
        rawErrors,
        required,
        uiSchema,
        onChange,
        value,
        schema: { title },
    } = props;
    const { icon } = getUiOptions(uiSchema);
    console.log('🚀 ~ uiSchema:', uiSchema);

    const fetchApiData = async (value: string) => {
        // todo:vijaya: api integration
    };
    const onChangeHandler = async (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        onChange(value);
        await fetchApiData(value);
    };

    return (
        <div className={`${clsx(inputStyles.inputContainer, style.autoCompleteContainer)} `}>
            <Icon type={icon as IconType} className={inputStyles.icon} color="#676767" />
            <input
                aria-labelledby="case-search-label"
                placeholder={title}
                className={clsx(inputStyles.input, style.iconInput, 'text-body-sm focus:!ring-0')}
                onChange={onChangeHandler}
                key={id}
                value={value}
                disabled={disabled}
            />
            {rawErrors &&
                rawErrors.map(error => (
                    <AssistiveText key={error} text={error} variant={AssistiveTextVariant.Error} className="mt-2 max-w-[210px]" />
                ))}
            <div className={style.detailContainer}>
                <div className={style.card}>
                    <div className="icon">
                        <Icon width={25} height={25} type={IconType.DOCUMENT_TEXT} />
                    </div>
                    <div className="text-content">
                        <div className={style.title}>John Doe</div>
                        <div className={style.subTitle}>Software Engineer</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
