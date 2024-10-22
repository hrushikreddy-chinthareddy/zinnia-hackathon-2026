import { ErrorSchema } from '@rjsf/utils';
import { Label } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { InputHTMLAttributes } from 'react';

import styles from './text-field.module.css';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label?: string;
    fieldSize?: 'small' | 'large';
    status?: 'success' | 'error';
    disabled?: boolean;
    onChange: (value: any, es?: ErrorSchema<any> | undefined, id?: string) => void;
}

const TextField = (props: TextFieldProps) => {
    const { id, label, value, className, disabled, onChange, onBlur, onFocus } = props;

    const classes = clsx(
        // styles.error,
        styles.textField,
        styles[props.fieldSize || 'small'],
        props.status && styles[props.status] ? styles[props.status] : '',
        className
    );

    return (
        <>
            {/* <FieldValue
                name={id}
                label={<Label labelFor={id}>{label}</Label>}
                id={id}
                disabled={disabled}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
            ></FieldValue> */}

            {!!label && <Label labelFor={id}>{label}</Label>}
            <input id={id} className={`${classes}`} onChange={onChange} placeholder={label} value={value} />
        </>
    );
};

export default TextField;
