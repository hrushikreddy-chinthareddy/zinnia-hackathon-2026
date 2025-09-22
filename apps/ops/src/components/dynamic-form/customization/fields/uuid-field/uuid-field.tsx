import { FieldProps, getUiOptions } from '@rjsf/utils';
import { v4 as uuidv4 } from 'uuid';

import TextField from '@deps/components/dynamic-form/components/text-field/text-field';

import style from '../../widgets/text-widget/text-widget.module.css';

const UUIDField = (props: FieldProps) => {
    const {
        formData,
        onChange,
        uiSchema,
        readonly,
        disabled,
        required,
        rawErrors,
        hideError,
        placeholder,
        id,
        schema,
    } = props;

    const { hidden } = getUiOptions(uiSchema);
    if (!formData) {
        const uuid = uuidv4();

        setTimeout(() => onChange(uuid), 0);
    }

    if (hidden) {
        return null;
    }

    return (
        <div className="max-w-sm flex w-full flex-col">
            <TextField
                label={schema.title}
                className={readonly || disabled ? style.readOnly : ''}
                placeholder={placeholder}
                id={id || ''}
                value={formData || ''}
                required={required}
                disabled={disabled}
                onChange={onChange}
                hideError={hideError}
                status={
                    rawErrors && rawErrors?.length > 0 ? 'error' : undefined
                }
            />
        </div>
    );
};

export default UUIDField;
