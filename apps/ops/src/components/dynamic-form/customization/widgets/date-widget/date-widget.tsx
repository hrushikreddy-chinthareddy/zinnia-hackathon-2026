import { pad, FormContextType, RJSFSchema, StrictRJSFSchema, WidgetProps, getUiOptions } from '@rjsf/utils';

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
    value,
    onChange,
    disabled,
    uiSchema
}: WidgetProps<T, S, F>) {
    const { futureDateEnabled } = getUiOptions(uiSchema);
    const disableAfterDate = futureDateEnabled ? undefined : new Date();
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
            <FieldDate name={id} id={id} onDateSelect={_onSelectDate} defaultDate={value} disableAfterDate={disableAfterDate} />
        </div>
    );
}
