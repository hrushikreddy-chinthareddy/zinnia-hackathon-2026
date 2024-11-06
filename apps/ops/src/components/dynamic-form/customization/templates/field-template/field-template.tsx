import { FieldTemplateProps } from '@rjsf/utils';
import { Divider, Label, Tooltip } from '@zinnia/bloom/components';

import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import styles from './field-template.module.css';
export function FieldTemplate(props: FieldTemplateProps) {
    const { id, label, displayLabel, required, description, errors, children, readonly, formData, classNames, uiSchema } = props;

    const helpText = uiSchema && uiSchema['ui:options']?.['help'] ? uiSchema['ui:options']?.['help'] : '';

    const helpInformation = helpText ? (
        <Tooltip trigger={<CircleInfoIcon height={'16px'} width={'16px'} className="text-primary" />}>{helpText}</Tooltip>
    ) : (
        ''
    );

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
