import { FieldTemplateProps } from '@rjsf/utils';
import { Icon, IconType, Label, Tooltip } from '@zinnia/bloom/components';

import styles from './field-template.module.css';
export function FieldTemplate(props: FieldTemplateProps) {
    const { id, label, displayLabel, required, description, errors, children } = props;
    const { help } = props.help?.props || {};
    const helpInformation = help ? <Tooltip trigger={<Icon type={IconType.CIRCLE_INFO} />}>{help}</Tooltip> : '';

    const fieldLabel = label ? `${label} ${required ? '*' : ''}` : '';
    return (
        <div className={styles.children}>
            {displayLabel && (
                <Label labelFor={id} interactiveElements={[helpInformation]}>
                    {fieldLabel}
                </Label>
            )}
            {description}
            {children}
            {errors}
        </div>
    );
}
