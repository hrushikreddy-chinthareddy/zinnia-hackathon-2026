import clsx from 'clsx';
import { InputHTMLAttributes } from 'react';

import styles from './text-field.module.css';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    fieldSize?: 'small' | 'large';
    status?: 'success' | 'error';
    disabled: boolean;
}

const TextField = (props: TextFieldProps) => {
    const { className, disabled, ...rest } = props;

    const classes = clsx(
        // styles.error,
        styles.textField,
        styles[props.fieldSize || 'small'],
        props.status && styles[props.status] ? styles[props.status] : '',
        className
    );

    return <input className={`${classes}`} {...rest} onChange={props.onChange} />;
};

export default TextField;
