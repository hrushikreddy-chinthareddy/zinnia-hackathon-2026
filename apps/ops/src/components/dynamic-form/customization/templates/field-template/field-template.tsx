import { FieldTemplateProps, getUiOptions } from '@rjsf/utils';
import {
    Divider,
    Label,
    Tooltip,
    TooltipPlacement,
} from '@zinnia/bloom/components';
import clsx from 'clsx';

import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import styles from './field-template.module.css';

export function FieldTemplate(props: FieldTemplateProps) {
    const {
        id,
        label,
        required,
        description,
        errors,
        children,
        readonly,
        classNames,
        uiSchema,
        hideError = false,
        schema,
    } = props;
    let { formData } = props;
    const uiOptions = getUiOptions(uiSchema);
    const helpText = uiOptions.help;

    const style = uiOptions?.style ?? '';
    const isLink = uiOptions?.type === 'link';
    let { displayLabel } = props;

    if (uiOptions.label === false) {
        displayLabel = false;
    }

    const helpInformation = helpText && (
        <Tooltip
            trigger={
                <CircleInfoIcon
                    onClick={(e) => e.preventDefault()}
                    height={'16px'}
                    width={'16px'}
                    className="text-primary"
                />
            }
            placement={TooltipPlacement.TopRight}
        >
            {helpText}
        </Tooltip>
    );

    const fieldLabel = label ? (
        <span className={styles.labelRequired}>
            {label}
            {required && (
                <span className={styles.requiredAsterisk}>
                    {'\u00A0'}
                    {'\u002A'}{' '}
                </span>
            )}
        </span>
    ) : (
        ''
    );

    const isInlineWithoutLabel = !uiOptions?.label && uiOptions?.inline;

    if (uiOptions.isQuoted && formData && typeof formData === 'string') {
        formData = `"${formData}"`;
    }
    // Helper to render the nested list for CheckBoxesSelectWidget
    const renderCheckBoxesSelectWidgetList = (data: any) => {
        const items = Array.isArray(data) ? data : [data];
        return (
            <ol className="list-decimal ml-5">
                {items.map((item: any, idx: number) => (
                    <li key={idx}>
                        {item.detailedReason}
                        {item.exceptionSubRefs &&
                            item.exceptionSubRefs.length > 0 && (
                                <ol className="list-[lower-alpha] ml-6 font-normal">
                                    {item.exceptionSubRefs.map(
                                        (sub: any, subIdx: number) => (
                                            <li key={subIdx}>{sub.value}</li>
                                        )
                                    )}
                                </ol>
                            )}
                    </li>
                ))}
            </ol>
        );
    };
    return (
        <>
            {uiOptions?.widget === 'CheckBoxesSelectWidget' &&
            readonly &&
            formData ? (
                <div style={{ marginBottom: 12 }}>
                    <div>{fieldLabel}</div>
                    {renderCheckBoxesSelectWidgetList(formData)}
                </div>
            ) : uiOptions?.templateType === 'table' ? (
                readonly && typeof formData === 'string' ? (
                    formData
                ) : (
                    children
                )
            ) : (
                <div className={uiOptions?.classNames || ''}>
                    {classNames?.indexOf('divider') !== -1 && (
                        <div className="mb-4">
                            <Divider direction="horizontal" color="subtle" />
                        </div>
                    )}
                    <div className={styles.children} key={id}>
                        {displayLabel && (
                            <div className="mb-2 ">
                                <Label
                                    labelFor={id}
                                    interactiveElements={[helpInformation]}
                                >
                                    <span
                                        className={clsx(
                                            'text-md font-medium',
                                            style as string
                                        )}
                                    >
                                        {fieldLabel}
                                    </span>
                                </Label>
                            </div>
                        )}
                        {readonly &&
                        typeof formData === 'string' &&
                        !(schema.enum || uiOptions.format === 'numeric') &&
                        !isLink &&
                        !isInlineWithoutLabel
                            ? formData
                            : children}
                        {!hideError && errors}
                    </div>
                </div>
            )}
        </>
    );
}
