import { FieldTemplateProps, getUiOptions } from '@rjsf/utils';
import { Divider, Label, Tooltip, TooltipPlacement } from '@zinnia/bloom/components';

import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import styles from './field-template.module.css';

export function FieldTemplate(props: FieldTemplateProps) {
    const { id, label, displayLabel, required, description, errors, children, readonly, formData, classNames, uiSchema } = props;
    const uiOptions = getUiOptions(uiSchema);
    const helpText = uiOptions.help;

    const helpInformation = helpText && (
        <Tooltip
            trigger={<CircleInfoIcon onClick={e => e.preventDefault()} height={'16px'} width={'16px'} className="text-primary" />}
            placement={TooltipPlacement.TopRight}
        >
            {helpText}
        </Tooltip>
    );
    const fieldLabel = label ? `${label} ${required ? '*' : ''}` : '';
    return (
        <>
            {classNames?.indexOf('divider') !== -1 && (
                <div className="mb-4">
                    <Divider direction="horizontal" color="subtle" />
                </div>
            )}
            <div className={styles.children}>
                {displayLabel && (
                    <div className="mb-1">
                        <Label labelFor={id} interactiveElements={[helpInformation]}>
                            {fieldLabel}
                        </Label>
                    </div>
                )}
                {description}
                {readonly && typeof formData === 'string' ? formData : children}
                {errors}
            </div>
        </>
    );
}
