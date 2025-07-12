import {
    Form,
    FormField,
    FormControl,
    FormMessage,
} from '@radix-ui/react-form';
import { Icon, IconProps } from '@zinnia/bloom/components';
import { useEffect, useState } from 'react';

import style from './input.module.css';

export type InputPrefix =
    | { type: 'string'; text: string }
    | { type: 'icon'; iconProps: IconProps };

export type CustomInputProps = {
    iconOrStringPrefix?: InputPrefix;
    name: string;
    errorMessage?: string;
    error?: boolean;
    textarea?: boolean;
    required?: boolean;
    value?: string;
    onAnswerChange: (val?: string) => void;
    inputType?: React.HTMLInputTypeAttribute;
    updateValueOnInputChange?: boolean;
    onBlur?: () => void;
    size?: 'sm' | 'md';
};

/**
 * @deprecated please use FieldData from Bloom instead
 */
export function Input({
    name,
    errorMessage,
    textarea,
    required,
    iconOrStringPrefix,
    error,
    value,
    inputType,
    onAnswerChange,
    updateValueOnInputChange,
    onBlur,
    size,
}: CustomInputProps) {
    const [fieldValue, setFieldValue] = useState<string>('');

    useEffect(() => {
        setFieldValue(value || '');
    }, [value]);

    const getPrefixMarkup = () => {
        if (iconOrStringPrefix?.type === 'icon') {
            return (
                <Icon
                    className={style.icon}
                    {...iconOrStringPrefix.iconProps}
                />
            );
        }
        if (iconOrStringPrefix?.type === 'string') {
            return (
                <span
                    className={`${style.stringIcon} typography-content-body-sm`}
                >
                    {iconOrStringPrefix.text}
                </span>
            );
        }
        return null;
    };

    return (
        <Form className={style.radixFormRoot}>
            <FormField
                name={name}
                className={style.radixFormField}
                data-invalid={error}
            >
                <div
                    className={style.prefixAndField}
                    data-has-prefix={Boolean(iconOrStringPrefix)}
                >
                    {iconOrStringPrefix && (
                        <div className={style.prefix}>{getPrefixMarkup()}</div>
                    )}
                    <FormControl
                        asChild
                        className={`${style.radixControl} ${
                            size === 'sm' && style.small
                        }`}
                    >
                        {!textarea ? (
                            <input
                                className={`${style.input} typography-content-body-sm`}
                                required={required}
                                value={fieldValue}
                                onBlur={() => {
                                    if (updateValueOnInputChange && onBlur) {
                                        onBlur();
                                    }
                                    onAnswerChange(fieldValue);
                                }}
                                onChange={(e) =>
                                    updateValueOnInputChange
                                        ? onAnswerChange(e.target.value)
                                        : setFieldValue(e.target.value)
                                }
                                type={inputType}
                            />
                        ) : (
                            <textarea
                                className={`${style.input} typography-content-body-sm`}
                                required={required}
                                value={fieldValue}
                                onBlur={() => {
                                    if (updateValueOnInputChange && onBlur) {
                                        onBlur();
                                    }
                                    onAnswerChange(fieldValue);
                                }}
                                onChange={(e) =>
                                    updateValueOnInputChange
                                        ? onAnswerChange(e.target.value)
                                        : setFieldValue(e.target.value)
                                }
                            />
                        )}
                    </FormControl>
                </div>
                {errorMessage && (
                    <FormMessage className={style.inputErrorMessage}>
                        {errorMessage}
                    </FormMessage>
                )}
            </FormField>
        </Form>
    );
}
