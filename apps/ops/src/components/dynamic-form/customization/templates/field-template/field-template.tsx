import { FieldTemplateProps } from '@rjsf/utils';
import { Label } from '@zinnia/bloom/components';

import styles from './field-template.module.css';
export function FieldTemplate(props: FieldTemplateProps) {
    const { id, label, displayLabel, help, required, description, errors, children } = props;
    const fieldLabel = label ?? `${label} ${required || '*'}` ?? '';
    return (
        <div className={styles.fieldChildren}>
            {displayLabel && <Label labelFor={id}>{fieldLabel}</Label>}
            {description}
            {children}
            {errors}
            {help}
        </div>
    );
}
