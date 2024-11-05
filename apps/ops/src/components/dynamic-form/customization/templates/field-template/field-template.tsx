import { FieldTemplateProps } from '@rjsf/utils';
import { Divider, Icon, IconType, Label, Tooltip } from '@zinnia/bloom/components';

import styles from './field-template.module.css';
export function FieldTemplate(props: FieldTemplateProps) {
    const { id, label, displayLabel, required, description, errors, children, readonly, formData, classNames } = props;
    const { help } = props.help?.props || {};
    const helpInformation = help ? <Tooltip trigger={<Icon type={IconType.CIRCLE_INFO} />}>{help}</Tooltip> : '';

    const fieldLabel = label ? `${label} ${required ? '*' : ''}` : '';

    if (readonly) {
        return (
            <>
                <div>{classNames?.indexOf('divider') !== -1 && <Divider direction="horizontal" />}</div>
                <div className={styles.children}>
                    {typeof formData === 'string' && (
                        <div>
                            <Label labelFor={id}>{fieldLabel}</Label>
                            {formData}
                        </div>
                    )}
                    {typeof formData !== 'string' && <>{children}</>}
                </div>
            </>
        );
    } else {
        return (
            <>
                <div>{classNames?.indexOf('divider') !== -1 && <Divider direction="horizontal" />}</div>
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
            </>
        );
    }
}
