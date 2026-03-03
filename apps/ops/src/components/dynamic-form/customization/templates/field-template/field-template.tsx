import { FieldTemplateProps, getUiOptions } from '@rjsf/utils';
import {
    Divider,
    Label,
    Tooltip,
    TooltipPlacement,
} from '@zinnia/bloom/components';
import clsx from 'clsx';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { FormattedAddress } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import {
    AddressFields,
    convertAddressFields,
} from '@deps/helpers/address.helpers';
import {
    isNullEmptyOrUndefined,
    isStringWithBrackets,
} from '@deps/helpers/string.helpers';
import { replacePlaceholders } from '@deps/helpers/value-placement.helpers';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import styles from './field-template.module.css';
import { TransactionSummaryTemplate } from '../transaction-summary-template/transaction-summary-template';

export enum FieldTemplateType {
    SummaryCard = 'summaryCard',
    Table = 'table',
    Address = 'address',
}

export const helpInformation = (helpText: string) => {
    if (!helpText) {
        return null;
    }
    return (
        <Tooltip
            trigger={
                <span tabIndex={0}>
                    <CircleInfoIcon
                        onClick={(e) => e.preventDefault()}
                        height={'16px'}
                        width={'16px'}
                        className="text-primary"
                    />
                </span>
            }
            placement={TooltipPlacement.TopRight}
            triggerClassName="w-fit"
            replaceElement
        >
            {helpText}
        </Tooltip>
    );
};
export function FieldTemplate(props: FieldTemplateProps) {
    const {
        id,
        label,
        required,
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

    const {
        help: helpText,
        assistiveText,
        assistiveColor,
        style = '',
        type,
        label: showLabel,
        titleVariant,
        rowFormData,
        classNames: wrapperClassNames,
        templateType,
        widget,
        format,
        isQuoted,
        titleClassName,
    } = uiOptions;

    const isLink = type === 'link';
    let { displayLabel } = props;

    const variant = (
        Object.values(TypographyVariant) as TypographyVariant[]
    ).includes(titleVariant as TypographyVariant)
        ? (titleVariant as TypographyVariant)
        : TypographyVariant.Label;

    if (showLabel === false) {
        displayLabel = false;
    }

    if (rowFormData && isStringWithBrackets(formData)) {
        formData = replacePlaceholders(
            formData,
            rowFormData as Record<string, any>
        );
    }
    if (isNullEmptyOrUndefined(formData) && schema.type === 'string') {
        formData = '-';
    }
    if (templateType === FieldTemplateType.SummaryCard) {
        return <TransactionSummaryTemplate {...props} />;
    }

    const modifiedLabel = isStringWithBrackets(label)
        ? replacePlaceholders(label, formData as Record<string, any>)
        : label;
    const fieldLabel = label ? (
        <span className={styles.labelRequired + ' ' + titleClassName}>
            <Typography variant={variant}>
                {modifiedLabel}
                {required && (
                    <span className={styles.requiredAsterisk}>
                        {'\u00A0'}
                        {'\u002A'}{' '}
                    </span>
                )}
            </Typography>
        </span>
    ) : (
        ''
    );

    const isDataTypeInReadOnly = readonly && uiOptions?.dataType;

    if (isQuoted && formData && typeof formData === 'string') {
        formData = `"${formData}"`;
    }

    const labelElement = (
        <div className="mb-2 ">
            <Label
                labelFor={id}
                interactiveElements={[helpInformation(helpText as string)]}
            >
                <span className={clsx('text-md font-medium', style as string)}>
                    {fieldLabel}
                </span>
            </Label>
        </div>
    );

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

    if (templateType === FieldTemplateType.Address && readonly) {
        const convertedAddressFields = convertAddressFields(
            formData as AddressFields
        );
        return (
            <>
                {labelElement}
                <FormattedAddress address={convertedAddressFields} />
            </>
        );
    }

    return (
        <>
            {widget === 'CheckBoxesSelectWidget' && readonly && formData ? (
                <div style={{ marginBottom: 12 }}>
                    <div>{fieldLabel}</div>
                    {renderCheckBoxesSelectWidgetList(formData)}
                </div>
            ) : templateType === FieldTemplateType.Table ? (
                readonly && typeof formData === 'string' ? (
                    formData
                ) : (
                    children
                )
            ) : (
                <div className={wrapperClassNames || ''}>
                    {classNames?.indexOf('divider') !== -1 && (
                        <div className="mb-4">
                            <Divider direction="horizontal" color="subtle" />
                        </div>
                    )}
                    <div className={styles.children} key={id}>
                        {displayLabel && labelElement}
                        {readonly &&
                        typeof formData === 'string' &&
                        !(schema.enum || format === 'numeric') &&
                        !isLink &&
                        !isDataTypeInReadOnly
                            ? formData
                            : children}
                        {!hideError && !readonly && errors}
                        {assistiveColor && assistiveText && (
                            <AssistiveText
                                text={assistiveText as string}
                                variant={assistiveColor as AssistiveTextVariant}
                                className="mt-2"
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
