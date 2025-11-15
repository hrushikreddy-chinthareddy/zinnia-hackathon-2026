import { WidgetProps } from '@rjsf/utils';
import { FieldSize } from '@zinnia/bloom/components';
import xss from 'xss';

import Field, { FieldType, FieldVariant } from '@deps/components/fields/field';

const EmailWidget = (props: WidgetProps) => {
    const { value, disabled, onChange, readonly } = props;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitizedEmail = xss(e.target.value.trim());
        onChange(sanitizedEmail === '' ? undefined : sanitizedEmail);
    };

    if (readonly) {
        return value;
    }

    return (
        <div className="max-w-sm flex w-full flex-col pl-1">
            <Field
                disabled={disabled}
                onChange={handleChange}
                value={value}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                variant={
                    disabled ? FieldVariant.Inactive : FieldVariant.Default
                }
            />
        </div>
    );
};

export default EmailWidget;
