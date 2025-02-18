import { ErrorSchema } from '@rjsf/utils';
import { InputHTMLAttributes } from 'react';

import Field, { FieldFormat, FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label?: string;
    fieldSize?: 'small' | 'large';
    status?: 'success' | 'error';
    disabled?: boolean;
    placeholder?: string;
    type?: string;
    startIcon?: React.ReactNode;
    leading?: React.ReactNode;
    endIcon?: React.ReactNode;
    onChange: (value: any, es?: ErrorSchema<any> | undefined, id?: string) => void;
}

const TextField = (props: TextFieldProps) => {
    const { id, label, value, disabled, placeholder, onChange, onBlur, onFocus, type, startIcon, endIcon, leading } = props;

    const formatOptions =
        type === 'number'
            ? {
                  format: '',
                  type: (type as FieldFormat) || 'string',
                  decimalPlaces: 2,
              }
            : undefined;
    return (
        <>
            <Field
                id={id}
                label={label}
                onChange={e => onChange(e.target.value)}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                placeholder={placeholder}
                leading={leading}
                startIcon={startIcon}
                endIcon={endIcon}
                value={value?.toString()}
                onBlur={onBlur}
                onFocus={onFocus}
                name={label}
                formatOptions={formatOptions}
                variant={disabled ? FieldVariant.Inactive : FieldVariant.Default}
            />
        </>
    );
};

export default TextField;
