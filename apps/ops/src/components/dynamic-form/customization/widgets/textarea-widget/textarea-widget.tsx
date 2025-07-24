import {
    FormContextType,
    getUiOptions,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
} from '@rjsf/utils';

import { csrApiHelper } from '@deps/helpers/csr-api-helpers';
import { ApiProps, ApiResponseTypes } from '@deps/models/case/task';

import styles from './textarea-widget.module.css';

export type TextareaWidgetProps<
    T,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
> = WidgetProps<T, S, F>;

function TextareaWidget<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>(props: TextareaWidgetProps<T, S, F>) {
    const {
        id,
        value,
        disabled,
        onChange,
        uiSchema,
        formContext,
        placeholder,
        readonly,
    } = props;
    const { props: uiProps } = getUiOptions<T, S, F>(uiSchema);
    const apiProps =
        typeof uiProps === 'object' ? (uiProps as ApiProps) : ({} as ApiProps);

    const handleChange = async (event: any) => {
        onChange(event.target.value);
        if (apiProps.apiUrl) {
            const response = await csrApiHelper(apiProps, {
                ...formContext?.customData,
                value: event.target.value,
            });
            if (apiProps.responseType === ApiResponseTypes.FormData) {
                formContext?.setCustomData &&
                    formContext.setCustomData({
                        [apiProps?.dataKey]: response,
                    });
            } else {
                formContext?.updateSchema &&
                    formContext.updateSchema({ [apiProps?.dataKey]: response });
            }
        }
    };

    return (
        <div className={styles.container}>
            <textarea
                id={id}
                className={styles.textarea}
                value={value || ''}
                disabled={disabled || readonly}
                onChange={handleChange}
                placeholder={placeholder}
                rows={4}
            />
        </div>
    );
}

export default TextareaWidget;
