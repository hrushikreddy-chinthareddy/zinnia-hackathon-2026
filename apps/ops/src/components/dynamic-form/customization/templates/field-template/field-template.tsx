import { FieldTemplateProps, getUiOptions } from '@rjsf/utils';
import { Divider, Label, Tooltip } from '@zinnia/bloom/components';

import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import styles from './field-template.module.css';

export function FieldTemplate(props: FieldTemplateProps) {
    const { id, label, displayLabel, required, description, errors, children, readonly, formData, classNames, uiSchema } = props;
    const uiOptions = getUiOptions(uiSchema);
    const helpText = uiOptions.help;

    const helpInformation = helpText && (
        <Tooltip trigger={<CircleInfoIcon onClick={e => e.preventDefault()} height={'16px'} width={'16px'} className="text-primary" />}>
            {helpText}
        </Tooltip>
    );
    const fieldLabel = label ? `${label} ${required ? '*' : ''}` : '';
    return (
        <>
            <div>{classNames?.indexOf('divider') !== -1 && <Divider direction="horizontal" color="subtle" />}</div>
            <div className={styles.children}>
                {displayLabel && (
                    <Label labelFor={id} interactiveElements={[helpInformation]}>
                        {fieldLabel}
                    </Label>
                )}
                {description}
                {readonly && typeof formData === 'string' ? formData : children}
                {errors}
            </div>
        </>
    );
}
