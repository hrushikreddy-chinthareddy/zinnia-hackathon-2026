import {
    pad,
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
    WidgetProps,
    getUiOptions,
} from '@rjsf/utils';
import { FieldStatus } from '@zinnia/bloom/components';

import { FieldDate } from '@deps/components/field/date/FieldDate';

import { formatValueByDataType } from '../../templates/card-templates/card-template';

const formatDate = (date?: Date) => {
    if (!date) {
        return '';
    }
    const yyyy = pad(date.getFullYear(), 4);
    const MM = pad(date.getMonth() + 1, 2);
    const dd = pad(date.getDate(), 2);
    return `${yyyy}-${MM}-${dd}`;
};

export default function DateWidget<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>(props: WidgetProps<T, S, F>) {
    const { id, value, onChange, disabled, uiSchema, readonly, rawErrors } =
        props;
    const { futureDateEnabled, inline, title } = getUiOptions(uiSchema);

    const disableAfterDate = futureDateEnabled ? undefined : new Date();

    const _onSelectDate = (date: Date | null | undefined) => {
        if (date) {
            const formatted = formatDate(date);
            formatted && onChange(formatted);
        }
    };

    if (inline) {
        return (
            <div className="grid grid-cols-2 text-md  max-w-screen-sm">
                <div className="text-gray-500">{title}</div>
                <div>{formatValueByDataType('date', value)}</div>
            </div>
        );
    }

    return (disabled as boolean) ? (
        <div>{value}</div>
    ) : readonly ? (
        <>{value}</>
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <FieldDate
                name={id}
                id={id}
                onDateSelect={_onSelectDate}
                defaultDate={value}
                disableAfterDate={disableAfterDate}
                fieldStatus={
                    rawErrors && rawErrors?.length > 0
                        ? FieldStatus.ERROR
                        : FieldStatus.DEFAULT
                }
            />
        </div>
    );
}
