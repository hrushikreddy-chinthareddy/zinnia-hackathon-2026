import { WidgetProps } from '@rjsf/utils';
import { useEffect, useState } from 'react';

import Field, {
    FieldFormat,
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';

const validateSSN = (value: string) => {
    const ssnPattern = /^(\d{3}-\d{2}-\d{4}|\d{9})$/;
    return value && !ssnPattern.test(value);
};

const SSNWidget = ({
    id,
    value,
    disabled,
    readonly,
    required,
    onChange,
}: WidgetProps) => {
    const hasInvalidSSN = validateSSN(value);
    const [validate, setValidate] = useState(hasInvalidSSN);
    const ssnFormat = {
        type: 'pattern' as FieldFormat,
        format: '###-##-####',
    };

    useEffect(() => {
        const hasInvalidSSN = validateSSN(value);
        setValidate(hasInvalidSSN);
    }, [value]);

    return readonly ? (
        value
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <Field
                name={id}
                value={value ? value.replace(/\D/g, '') : ''}
                id={id}
                disabled={disabled}
                required={required}
                readOnly={readonly}
                formatOptions={ssnFormat}
                onChange={(e) => onChange(e.target.value)}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                variant={validate ? FieldVariant.Error : FieldVariant.Default}
                message={
                    validate
                        ? 'Please enter a valid SSN (XXX-XX-XXXX or 9 digits)'
                        : ''
                }
            />
        </div>
    );
};

export default SSNWidget;
