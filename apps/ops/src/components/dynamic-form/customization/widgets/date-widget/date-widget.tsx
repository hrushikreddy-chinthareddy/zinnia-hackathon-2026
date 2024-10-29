import {
    // ariaDescribedByIds,
    // labelValue,
    pad,
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
    // TranslatableString,
    WidgetProps,
} from '@rjsf/utils';
import { Label } from '@zinnia/bloom/components';

import { FieldDate } from '@deps/components/field/date/FieldDate';

const formatDate = (date?: Date) => {
    if (!date) {
        return '';
    }
    const yyyy = pad(date.getFullYear(), 4);
    const MM = pad(date.getMonth() + 1, 2);
    const dd = pad(date.getDate(), 2);
    return `${yyyy}-${MM}-${dd}`;
};

export default function DateWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    id,
    label,
    value,
    onChange,
    disabled,
}: WidgetProps<T, S, F>) {
    const _onSelectDate = (date: Date | null | undefined) => {
        if (date) {
            const formatted = formatDate(date);
            formatted && onChange(formatted);
        }
    };

    return (disabled as boolean) ? (
        <div>{value}</div>
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <FieldDate
                label={<Label labelFor={id}>{label}</Label>}
                name={id}
                id={id}
                onDateSelect={_onSelectDate}
                defaultDate={value}
                disableAfterDate={new Date()}
            />
        </div>
    );
}
