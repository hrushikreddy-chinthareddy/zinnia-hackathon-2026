import {
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
    getUiOptions,
} from '@rjsf/utils';
import dayjs from 'dayjs';

import {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

import { formatValueByDataType } from '../../templates/card-templates/card-template';

export default function NewDateWidget<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>(props: WidgetProps<T, S, F>) {
    const { value, onChange, disabled, uiSchema, readonly } = props;

    const normalizeInput = (input: string): string | null => {
        if (dayjs(input, NUMERIC_DATE_FORMAT, true).isValid()) {
            return input;
        }

        if (/^\d{2}-\d{2}-\d{4}$/.test(input)) {
            const parsed = dayjs(input, 'MM-DD-YYYY', true);
            if (parsed.isValid()) {
                return parsed.format(NUMERIC_DATE_FORMAT);
            }
        }

        if (/^\d{8}$/.test(input)) {
            const parsed = dayjs(input, 'MM-DD-YYYY', true);
            if (parsed.isValid()) {
                return parsed.format(NUMERIC_DATE_FORMAT);
            }
        }

        const parsed = dayjs(input);
        if (parsed.isValid()) {
            return parsed.format(NUMERIC_DATE_FORMAT);
        }
        return null;
    };
    const { inline, title } = getUiOptions(uiSchema);

    const _onSelectDate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        const normalized = normalizeInput(inputValue);

        if (normalized && normalized !== value) {
            onChange(normalized);
        }
    };

    const formattedValue =
        value && dayjs(value, NUMERIC_DATE_FORMAT, true).isValid()
            ? value
            : value
            ? normalizeInput(value) || ''
            : '';

    if (inline) {
        return (
            <div className="grid grid-cols-2 text-md  max-w-screen-sm">
                <div className="text-gray-500">{title}</div>
                <div>{formatValueByDataType('date', value)}</div>
            </div>
        );
    }

    return disabled ? (
        <div>{value}</div>
    ) : readonly ? (
        <>{value}</>
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <FieldDateSelect
                isFutureDateDisabled={false}
                label={title}
                onChange={_onSelectDate}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={formattedValue}
                disabled={disabled}
                variant={
                    disabled ? FieldVariant.Inactive : FieldVariant.Default
                }
            />
        </div>
    );
}
