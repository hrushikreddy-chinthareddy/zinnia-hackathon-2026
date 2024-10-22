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
// import _pick from 'lodash/pick';
import { FocusEvent } from 'react';

import { FieldDate } from '@deps/components/field/date/FieldDate';

// Keys of IDropdownProps from @fluentui/react
// const allowedProps = [
//     'componentRef',
//     'styles',
//     'theme',
//     'calloutProps',
//     'calendarProps',
//     'textField',
//     'calendarAs',
//     'onSelectDate',
//     'label',
//     'isRequired',
//     'disabled',
//     'ariaLabel',
//     'underlined',
//     'pickerAriaLabel',
//     'isMonthPickerVisible',
//     'showMonthPickerAsOverlay',
//     'allowTextInput',
//     'disableAutoFocus',
//     'placeholder',
//     'today',
//     'value',
//     'formatDate',
//     'parseDateFromString',
//     'firstDayOfWeek',
//     'strings',
//     'highlightCurrentMonth',
//     'highlightSelectedMonth',
//     'showWeekNumbers',
//     'firstWeekOfYear',
//     'showGoToToday',
//     'borderless',
//     'className',
//     'dateTimeFormatter',
//     'minDate',
//     'maxDate',
//     'initialPickerDate',
//     'allFocusable',
//     'onAfterMenuDismiss',
//     'showCloseButton',
//     'tabIndex',
// ];

// const controlClass = mergeStyleSets({
//     control: {
//         margin: '0 0 15px 0',
//     },
// });

// TODO: move to utils.
// TODO: figure out a standard format for this, as well as
// how we can get this to work with locales.
const formatDate = (date?: Date) => {
    if (!date) {
        return '';
    }
    const yyyy = pad(date.getFullYear(), 4);
    const MM = pad(date.getMonth() + 1, 2);
    const dd = pad(date.getDate(), 2);
    return `${yyyy}-${MM}-${dd}`;
};

// const parseDate = (dateStr?: string) => {
//     if (!dateStr) {
//         return undefined;
//     }
//     const [year, month, day] = dateStr.split('-').map(e => parseInt(e));
//     const dt = new Date(year, month - 1, day);
//     return dt;
// };

export default function DateWidget<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
    id,
    // required,
    label,
    // hideLabel,
    value,
    onChange,
    onBlur,
    onFocus,
    // options,
    // placeholder,
    // registry,
    disabled,
}: WidgetProps<T, S, F>) {
    // const { translateString } = registry;
    const _onSelectDate = (date: Date | null | undefined) => {
        if (date) {
            const formatted = formatDate(date);
            formatted && onChange(formatted);
        }
    };
    const _onBlur = ({ target }: FocusEvent<HTMLInputElement>) => onBlur(id, target && target.value);
    const _onFocus = ({ target }: FocusEvent<HTMLInputElement>) => onFocus(id, target && target.value);

    // const uiProps = _pick((options.props as object) || {}, allowedProps);

    return (disabled as boolean) ? (
        { value }
    ) : (
        <div className="max-w-sm flex w-full flex-col">
            <FieldDate
                label={<Label labelFor="one-time-premium-payment-date">{label}</Label>}
                name="one-time-premium-payment"
                // onDateSelect={date => field.onChange(dayjs(date).format(DEFAULT_DATE_FORMAT))}
                // defaultDate={formState.defaultValues?.effectiveDate || ''}
                // disableAfterDate={new Date(sixtyDaysInFutureDay)}
                // disableBeforeDate={new Date()}
                // fieldStatus={formState.errors.effectiveDate ? FieldStatus.ERROR : FieldStatus.DEFAULT}
                // errorMessage={formState.errors.effectiveDate?.message}
            />
        </div>
        // <DatePicker
        //     defaultMonth={new Date('1969-12-31T18:30:00.000Z')}
        //     mode="single"
        //     onSelect={function ra() {}}
        //     selected={new Date('1969-12-31T18:30:00.000Z')}
        // />
    );
}
