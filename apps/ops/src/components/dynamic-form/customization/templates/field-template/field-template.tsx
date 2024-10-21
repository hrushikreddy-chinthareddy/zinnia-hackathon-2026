import { FieldTemplateProps } from '@rjsf/utils';
import { Label } from '@zinnia/bloom/components';

export function FieldTemplate(props: FieldTemplateProps) {
    const { id, classNames, label, help, required, description, errors, children } = props;
    const fieldLabel = label ?? `${label} ${required || '*'}` ?? '';
    return (
        <div className={classNames}>
            <Label labelFor={id}>{fieldLabel}</Label>
            {description}
            {children}
            {errors}
            {help}
        </div>
    );
}
