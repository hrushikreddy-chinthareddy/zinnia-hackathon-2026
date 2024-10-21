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
    disabled: boolean;
    onChange: (value: any, es?: ErrorSchema<any> | undefined, id?: string) => void;
}

const TextField = (props: TextFieldProps) => {
    const { id, label, className, disabled, onChange, onBlur, onFocus, ...rest } = props;
    const textFieldId = id;
    const additionalLabelId = `${textFieldId}-label`;
    const classes = clsx(
        // styles.error,
        styles.textField,
        styles[props.fieldSize || 'small'],
        props.status && styles[props.status] ? styles[props.status] : '',
        className
    );

    return (
        <div>
            {!!label && (
                <div className={styles.label} id={additionalLabelId}>
                    <Label>{label}</Label>
                </div>
            )}
            <input className={`${classes}`} {...rest} onChange={onChange} />
        </div>
    );
};

export default TextField;
