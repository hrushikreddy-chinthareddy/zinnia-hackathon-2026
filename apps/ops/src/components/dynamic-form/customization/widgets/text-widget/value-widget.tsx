import { getUiOptions, WidgetProps } from '@rjsf/utils';
import { Badge, BadgeVariant, Tag } from '@zinnia/bloom/components';

import Field, {
    FieldFormat,
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { replacePlaceholders } from '@deps/helpers/value-placement.helpers';
export const ValueWidget = function (props: WidgetProps) {
    const {
        id,
        value,
        disabled,
        readonly,
        required,
        onChange,
        placeholder,
        schema,
        uiSchema,
        rawErrors,
    } = props;
    const numberFormat = {
        type: 'number' as FieldFormat,
        decimalPlaces: 2,
        format: 'en-US',
    };

    const rowFormData = props.options?.rowFormData;

    const defaultValue = rowFormData
        ? replacePlaceholders(
              schema?.default ?? value,
              rowFormData as Record<string, any>
          )
        : value;

    const formatNumber = (num: any) => {
        return parseFloat(num).toLocaleString('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
        });
    };
    const UiOptions = getUiOptions(uiSchema);
    const display = UiOptions.display;
    if (display === 'tag') {
        return <Tag text={defaultValue} />;
    }

    if (readonly && UiOptions.true && UiOptions.false) {
        const label =
            defaultValue === 'true'
                ? typeof UiOptions.true === 'string'
                    ? UiOptions.true
                    : JSON.stringify(UiOptions.true)
                : typeof UiOptions.false === 'string'
                ? UiOptions.false
                : JSON.stringify(UiOptions.false);
        return UiOptions.badge ? (
            <Badge
                variant={
                    defaultValue === 'true'
                        ? BadgeVariant.SUCCESS
                        : BadgeVariant.ERROR
                }
                label={String(label)}
            />
        ) : (
            <Typography variant={TypographyVariant.Body}>
                {String(label)}
            </Typography>
        );
    }
    if (readonly && UiOptions.format === 'numeric') {
        return <div>${defaultValue}</div>;
    }

    return (disabled as boolean) ? (
        <div>{defaultValue}</div>
    ) : readonly ? (
        <>{formatNumber(defaultValue)}</>
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <Field
                name={id}
                value={defaultValue ?? ''}
                formatOptions={numberFormat}
                leading={<div>$</div>}
                id={id}
                disabled={disabled}
                required={required}
                readOnly={readonly}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value.toString())}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                variant={
                    rawErrors && rawErrors?.length > 0
                        ? FieldVariant.Error
                        : FieldVariant.Default
                }
            />
        </div>
    );
};

export default ValueWidget;
