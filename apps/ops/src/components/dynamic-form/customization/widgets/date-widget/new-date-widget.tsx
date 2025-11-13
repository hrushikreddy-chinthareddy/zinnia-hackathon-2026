import {
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
    getUiOptions,
} from '@rjsf/utils';
import dayjs from 'dayjs';
import React from 'react';

import {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export default function NewDateWidget<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>(props: WidgetProps<T, S, F>) {
    const { value, onChange, disabled, uiSchema, readonly } = props;
    const { title } = getUiOptions(uiSchema);
    const normalizeInput = (input?: string | null): string | null => {
        if (!input) return null;

        const raw = input.trim();

        const possibleFormats = [
            ZAHARA_API_DATE_FORMAT,
            'MMDDYYYY',
            'MM/DD/YYYY',
            'DD/MM/YYYY',
            'YYYY/MM/DD',
            'YYYYMMDD',
        ];

        let parsed = dayjs(raw, possibleFormats, true);
        if (!parsed.isValid()) parsed = dayjs(raw, possibleFormats, false);

        return parsed.isValid() ? parsed.format(ZAHARA_API_DATE_FORMAT) : null;
    };

    const _onSelectDate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        const normalized = normalizeInput(raw);
        onChange(normalized || null);
    };

    return readonly ? (
        value
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <FieldDateSelect
                isFutureDateDisabled={false}
                label={title}
                onChange={_onSelectDate}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={normalizeInput(value) ?? ''}
                disabled={disabled}
                readOnly={readonly}
                disableFormat={true}
                variant={
                    disabled ? FieldVariant.Inactive : FieldVariant.Default
                }
            />
        </div>
    );
}
