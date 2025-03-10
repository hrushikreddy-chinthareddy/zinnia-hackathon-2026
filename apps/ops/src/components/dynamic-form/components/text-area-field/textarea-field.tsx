import { ErrorSchema } from '@rjsf/utils';
import { Label } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { InputHTMLAttributes } from 'react';

import styles from './textarea-field.module.css';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label?: string;
    fieldSize?: 'small' | 'large';
    status?: 'success' | 'error';
    disabled?: boolean;
    placeholder?: string;
    onChange: (value: any, es?: ErrorSchema<any> | undefined, id?: string) => void;
}

const TextAreaField = (props: TextFieldProps) => {
    const { id, label, value, className, disabled, placeholder, onChange, onBlur, onFocus } = props;

    const classes = clsx(
        styles.textareaField,
        styles[props.fieldSize || ''],
        props.status && styles[props.status] ? styles[props.status] : '',
        className
    );

    return (
        <>
            {!!label && <Label labelFor={id}>{label}</Label>}
            <input
                id={id}
                className={`${classes} `}
                disabled={disabled}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder ?? label}
                value={value}
                onBlur={onBlur}
                onFocus={onFocus}
            />
        </>
    );
};

export default TextAreaField;
